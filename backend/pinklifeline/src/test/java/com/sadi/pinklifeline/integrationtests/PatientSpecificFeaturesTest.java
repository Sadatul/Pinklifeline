package com.sadi.pinklifeline.integrationtests;

import com.sadi.pinklifeline.enums.Roles;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.collection.IsCollectionWithSize.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Rollback
@Transactional
public class PatientSpecificFeaturesTest extends AbstractBaseIntegrationTest{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtEncoder jwtEncoder;

    private final Logger logger = LoggerFactory.getLogger(PatientSpecificFeaturesTest.class);

    @Test
    @Sql("/test/patient_specific_features_test/nearbyUsers.sql")
    public void nearbySearchTest() throws Exception {
        Long id = 2L;
        Long locationShareUserId = 7L;
        String token = mint(id, List.of(Roles.ROLE_PATIENT));
        String out = mockMvc.perform(get("/v1/ROLE_PATIENT/nearby/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.*", hasSize(2))).andReturn().getResponse().getContentAsString();
        logger.info("first query output: {}", out);

        String updateToken = mint(locationShareUserId, List.of(Roles.ROLE_PATIENT));
        mockMvc.perform(put("/v1/ROLE_PATIENT/toggle-location-share")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", updateToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.locationShare").value(true));

        out = mockMvc.perform(get("/v1/ROLE_PATIENT/nearby/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.*", hasSize(3))).andReturn().getResponse().getContentAsString();
        logger.info("second query output: {}", out);
    }

    private String mint(Long id, List<Roles> roles){
        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .subject(id.toString())
                .issuer("self")
                .audience(List.of("pinklifeline"))
                .claim("scope", roles)
                .claim("subscribed", 0);
        JwtEncoderParameters parameters = JwtEncoderParameters.from(builder.build());
        return this.jwtEncoder.encode(parameters).getTokenValue();
    }
}
