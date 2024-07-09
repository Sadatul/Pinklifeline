package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.DoctorConsultationLocation;
import com.sadi.pinklifeline.models.reqeusts.DoctorLocationReq;
import com.sadi.pinklifeline.repositories.DoctorConsultancyLocationsRepository;
import com.sadi.pinklifeline.utils.DbCleaner;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Slf4j
public class DoctorSpecificFeaturesTest extends AbstractBaseIntegrationTest{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DbCleaner dbCleaner;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DoctorConsultancyLocationsRepository locationsRepository;

    @AfterEach
    public void cleanDb() {
        dbCleaner.clearDatabase();
    }

    @Test
    @Sql("/test/doctor_specific_features_test/add2Doctors.sql")
    public void addingNewDoctorConsultancyLocationTest() throws Exception {
        Long id = 2L;
        Long newLocationId = 1L;
        String token = mint(id, List.of(Roles.ROLE_DOCTOR));

        String requestBody = """
                {
                  "location":"sonadanga 2nd phase, Khulna",
                  "start":"07:43:23",
                  "end":"16:43:23",
                  "workdays":"1111110"
                }
                """;

        String location = mockMvc.perform(post("/v1/ROLE_DOCTOR/{id}/locations", id).contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", token))
                .content(requestBody)).andExpect(status().isCreated())
                .andReturn().getResponse().getHeader("Location");
        log.info("Doctor location URI: {}", location);
        DoctorLocationReq req = objectMapper.readValue(requestBody, DoctorLocationReq.class);
        log.info("Doctor location Req: {}", req);
        Optional<DoctorConsultationLocation> loc = locationsRepository.findById(newLocationId);
        if(loc.isEmpty()) {
            fail("New Doctor Location was not added");
        }
        log.info("Newly added doctor location: {}", loc.get());

        assertEquals(req.getLocation(), loc.get().getLocation());
        assertEquals(req.getStart(), loc.get().getStart());
        assertEquals(req.getEnd(), loc.get().getEnd());
        assertEquals(req.getWorkdays(), loc.get().getWorkdays());
        assertEquals(id, loc.get().getDoctorDetails().getUserId());
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
