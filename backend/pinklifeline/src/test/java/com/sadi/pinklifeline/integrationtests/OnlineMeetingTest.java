package com.sadi.pinklifeline.integrationtests;

import com.sadi.pinklifeline.enums.AppointmentStatus;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.Appointment;
import com.sadi.pinklifeline.repositories.OnlineMeetingRepository;
import com.sadi.pinklifeline.service.AppointmentService;
import com.sadi.pinklifeline.utils.DbCleaner;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.util.Pair;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Slf4j
public class OnlineMeetingTest extends AbstractBaseIntegrationTest{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DbCleaner dbCleaner;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private OnlineMeetingRepository onlineMeetingRepository;

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
        String location = mockMvc.perform(post("/v1/online-meeting/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", doctorToken))
                        .content(createMeetingRequest))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.callId").exists())
                        .andReturn().getResponse().getHeader("Location");

        log.info("Location to join meeting: {}", location);
        Appointment app = appointmentService.getAppointment(appointmentId);
        log.info("Appointment after meeting creation {}", app);
        assertEquals(AppointmentStatus.RUNNING, app.getStatus());
        Optional<Pair<Long, String>> data = onlineMeetingRepository.getAppIdAndCallIdForMeeting(doctorId);
        if(data.isEmpty()){
            fail("Meeting data was not saved");
        }
        assertEquals(appointmentId, data.get().getFirst());

        mockMvc.perform(get("/v1/online-meeting/join")
                        .header("Authorization", String.format("Bearer %s", userToken)))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.callId").exists());

        mockMvc.perform(delete("/v1/online-meeting/close")
                        .header("Authorization", String.format("Bearer %s", doctorToken)))
                        .andExpect(status().isNoContent());

        app = appointmentService.getAppointment(appointmentId);
        log.info("Appointment after closing {}", app);
        assertEquals(AppointmentStatus.FINISHED, app.getStatus());
        assertFalse(onlineMeetingRepository.ifUserInMeeting(patientId));
        assertFalse(onlineMeetingRepository.ifUserInMeeting(doctorId));

    }

    private String mint(Long id, List<Roles> roles){
        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .subject(id.toString())
                .issuer("self")
                .audience(List.of("pinklifeline"))
                .claim("scope", roles);
        JwtEncoderParameters parameters = JwtEncoderParameters.from(builder.build());
        return this.jwtEncoder.encode(parameters).getTokenValue();
    }
}
