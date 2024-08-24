package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.enums.AppointmentStatus;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.Appointment;
import com.sadi.pinklifeline.models.reqeusts.LivePrescriptionReq;
import com.sadi.pinklifeline.repositories.LivePrescriptionRepository;
import com.sadi.pinklifeline.repositories.OnlineMeetingRepository;
import com.sadi.pinklifeline.service.AppointmentService;
import com.sadi.pinklifeline.utils.DbCleaner;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.AfterEach;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.data.util.Pair;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Slf4j
public class OnlineMeetingTest extends AbstractBaseIntegrationTest{
    @Value("${auth.jwt.cookie.name}")
    private String cookieName;

    @LocalServerPort
    private int port;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DbCleaner dbCleaner;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private OnlineMeetingRepository onlineMeetingRepository;

    @Autowired
    private LivePrescriptionRepository livePrescriptionRepository;

    @AfterEach
    public void cleanDb() {
        dbCleaner.clearDatabase();
    }

    @Test
    @Sql("/test/appointments/addDoctorUserAppointment.sql")
    public void onlineMeetingCreationJoinAndCloseTest() throws Exception {
        Long patientId = 10L;
        Long doctorId = 11L;
        Long appointmentId = 2L;

        String userToken = mint(patientId, List.of(Roles.ROLE_PATIENT));
        String doctorToken = mint(doctorId, List.of(Roles.ROLE_DOCTOR));

        String createMeetingRequest = """
                {
                  "appointmentId": 2
                }
                """;
        ResultActions actions = mockMvc.perform(post("/v1/online-meeting/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", doctorToken))
                        .content(createMeetingRequest))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.callId").exists());

        String location = actions.andReturn().getResponse().getHeader("Location");
        log.info("Location to join meeting: {}", location);

        String responseBody = actions.andReturn().getResponse().getContentAsString();
        log.info("Response after starting a meeting: {}", responseBody);
        TypeReference<Map<String, Object>> typeRef = new TypeReference<>() {};
        Map<String, Object> response = objectMapper.readValue(responseBody, typeRef);
        String callId = (String) response.get("callId");

        Appointment app = appointmentService.getAppointment(appointmentId);
        log.info("Appointment after meeting creation {}", app);
        assertEquals(AppointmentStatus.RUNNING, app.getStatus());
        Optional<Pair<Long, String>> data = onlineMeetingRepository.getAppIdAndCallIdForMeeting(doctorId);
        if(data.isEmpty()){
            fail("Meeting data was not saved");
        }
        assertEquals(appointmentId, data.get().getFirst());

        LivePrescriptionReq req1 = new LivePrescriptionReq(patientId, callId,55.0, 50.0,"Analysis Added",
                new ArrayList<>(), new ArrayList<>());
        messageExchange(doctorToken, userToken, doctorId, patientId, req1);

        String s = mockMvc.perform(get("/v1/online-meeting/join")
                        .header("Authorization", String.format("Bearer %s", userToken)))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.callId").exists())
                        .andExpect(jsonPath("$.callId").value(callId))
                        .andExpect(jsonPath("$.prescription").exists())
                        .andExpect(jsonPath("$.prescription.analysis").value(req1.getAnalysis()))
                        .andReturn().getResponse().getContentAsString();
        log.info("The returned object after join {}", s);

        mockMvc.perform(delete("/v1/online-meeting/close")
                        .header("Authorization", String.format("Bearer %s", doctorToken)))
                        .andExpect(status().isNoContent());

        app = appointmentService.getAppointment(appointmentId);
        log.info("Appointment after closing {}", app);
        assertEquals(AppointmentStatus.FINISHED, app.getStatus());
        assertFalse(onlineMeetingRepository.ifUserInMeeting(patientId));
        assertFalse(onlineMeetingRepository.ifUserInMeeting(doctorId));
        assertFalse(livePrescriptionRepository.doesLivePrescriptionExists(callId));

    }

    public void messageExchange(String doctorToken, String patientToken, Long doctorId,
                                Long patientId, LivePrescriptionReq req) throws Exception {
        WebSocketStompClient stompClient1 = new WebSocketStompClient(new StandardWebSocketClient());
        WebSocketStompClient stompClient2 = new WebSocketStompClient(new StandardWebSocketClient());

        stompClient1.setMessageConverter(new MappingJackson2MessageConverter(objectMapper));
        stompClient2.setMessageConverter(new MappingJackson2MessageConverter(objectMapper));

        WebSocketHttpHeaders headers1 = new WebSocketHttpHeaders();
        headers1.add(HttpHeaders.COOKIE, String.format("%s=%s; HttpOnly", cookieName, doctorToken));
        WebSocketHttpHeaders headers2 = new WebSocketHttpHeaders();
        headers2.add(HttpHeaders.COOKIE, String.format("%s=%s; HttpOnly", cookieName, patientToken));

        StompSession stompSession1 = stompClient1.connectAsync(String.format("ws://localhost:%d/ws", port),
                        headers1,
                        new StompHeaders(), new StompSessionHandlerAdapter() {}
                )
                .get(1, TimeUnit.SECONDS);
        StompSession stompSession2 = stompClient2.connectAsync(String.format("ws://localhost:%d/ws", port),
                        headers2,
                        new StompHeaders(), new StompSessionHandlerAdapter() {}
                )
                .get(1, TimeUnit.SECONDS);

        final CountDownLatch latch2 = new CountDownLatch(1);
        final AtomicReference<LivePrescriptionReq> receivedMessage2 = new AtomicReference<>();

        stompSession2.subscribe(String.format("/user/%d/queue/live-prescription", patientId), new StompFrameHandler() {
            @Override
            public @NotNull Type getPayloadType(@NotNull StompHeaders headers) {
                return LivePrescriptionReq.class;
            }

            @Override
            public void handleFrame(@NotNull StompHeaders headers, Object payload) {
                LivePrescriptionReq message = (LivePrescriptionReq) payload;
                log.info("Received message {}: {}",patientId, message);
                receivedMessage2.set(message);
                latch2.countDown();
            }
        });

        stompSession1.send("/app/live-prescription", req);

        if(latch2.await(3, TimeUnit.SECONDS)){
            assertEquals(req.getAnalysis(), receivedMessage2.get().getAnalysis());
        } else {
            fail(String.format("Message from doctor with id: %d was not received", doctorId));
        }
    }

    private String mint(Long id, List<Roles> roles){
        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .subject(id.toString())
                .issuer("self")
                .audience(List.of("pinklifeline"))
                .claim("scope", roles)
                .claim("subscribed", false);
        JwtEncoderParameters parameters = JwtEncoderParameters.from(builder.build());
        return this.jwtEncoder.encode(parameters).getTokenValue();
    }
}
