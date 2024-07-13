package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.databind.ObjectMapper;
import static com.sadi.pinklifeline.controllers.AppointmentsHandlerV1.AcceptAppointmentReq;
import com.sadi.pinklifeline.enums.AppointmentStatus;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.Appointment;
import com.sadi.pinklifeline.models.reqeusts.RegisterAppointmentReq;
import com.sadi.pinklifeline.repositories.AppointmentRepository;
import com.sadi.pinklifeline.utils.DbCleaner;
import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Slf4j
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class AppointmentIntegrationTest extends AbstractBaseIntegrationTest{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DbCleaner dbCleaner;

    @Autowired
    private EntityManager entityManager;

    @AfterEach
    public void cleanDb() {
        dbCleaner.clearDatabase();
        entityManager.clear();
    }

    @Test
    @Sql(value = "/test/appointments/addUserAndDoctor.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void registerNewAppointmentThenAcceptThenCancelThenDeclineTest() throws Exception {
        Long userId = 3L;
        Long doctorId = 2L;

        String registerRequest = """
                {
                    "patientId": 3,
                    "doctorId": 2,
                    "patientContactNumber": "01730445524",
                    "locationId": 1,
                    "date": "2024-08-08",
                    "isOnline": true
                }
                """;
        String token = mint(userId, List.of(Roles.ROLE_PATIENT));
        String location = mockMvc.perform(post("/v1/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", token))
                .content(registerRequest)).andExpect(status().isCreated())
                .andReturn().getResponse().getHeader("Location");

        log.info("New resources is created at: {}", location);

        Optional<Appointment> app = appointmentRepository.findById(2L);

        if(app.isEmpty()){
            fail("Appointment was not created");
        }

        RegisterAppointmentReq req = objectMapper.readValue(registerRequest, RegisterAppointmentReq.class);
        log.info("New appointment req: {}", req.toString());
        log.info("New appointment is created at: {}", app.get());

        assertEquals(req.getDoctorId(), app.get().getDoctor().getUserId());
        assertEquals(req.getPatientId(), app.get().getUser().getId());
        assertEquals(req.getPatientContactNumber(), app.get().getPatientContactNumber());
        assertEquals(req.getLocationId(), app.get().getLocation().getId());
        assertEquals(req.getDate(), app.get().getDate());
        assertEquals(req.getIsOnline(), app.get().getIsOnline());
        assertEquals(req.getTime(), app.get().getTime());

        assertEquals(AppointmentStatus.REQUESTED, app.get().getStatus());
        assertEquals(false, app.get().getIsPaymentComplete());

        String doctorToken = mint(doctorId, List.of(Roles.ROLE_DOCTOR));

        String acceptRequest = """
                {
                    "time": "07:43:22"
                }
                """;

        mockMvc.perform(put("/v1/appointments/2/accept")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", doctorToken))
                .content(acceptRequest)).andExpect(status().isNoContent());

        Optional<Appointment> updateApp = appointmentRepository.findById(2L);
        AcceptAppointmentReq acceptReq = objectMapper.readValue(acceptRequest, AcceptAppointmentReq.class);
        if(updateApp.isEmpty()){
            fail("Appointment was somehow deleted");
        }
        log.info("New accepted appointment: {}", updateApp.get());
        assertEquals(acceptReq.getTime(), updateApp.get().getTime());
        assertEquals(AppointmentStatus.ACCEPTED, updateApp.get().getStatus());

        mockMvc.perform(delete("/v1/appointments/2/cancel")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", token)))
                .andExpect(status().isNoContent());

        Optional<Appointment> cancelledApp = appointmentRepository.findById(2L);
        if(cancelledApp.isEmpty()){
            fail("Appointment was somehow deleted");
        }
        log.info("New cancelled appointment: {}", cancelledApp.get());
        assertEquals(AppointmentStatus.CANCELLED, cancelledApp.get().getStatus());

        mockMvc.perform(delete("/v1/appointments/1/decline")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", doctorToken)))
                .andExpect(status().isNoContent());

        Optional<Appointment> declinedApp = appointmentRepository.findById(1L);
        if(declinedApp.isEmpty()){
            fail("Appointment was somehow deleted");
        }
        log.info("New declined appointment: {}", declinedApp.get());
        assertEquals(AppointmentStatus.DECLINED, declinedApp.get().getStatus());
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
