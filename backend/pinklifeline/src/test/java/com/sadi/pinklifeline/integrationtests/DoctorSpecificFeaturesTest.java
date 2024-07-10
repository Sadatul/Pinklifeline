package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.DoctorConsultationLocation;
import com.sadi.pinklifeline.models.entities.DoctorReview;
import com.sadi.pinklifeline.models.reqeusts.DoctorLocationReq;
import com.sadi.pinklifeline.models.reqeusts.DoctorReviewReq;
import com.sadi.pinklifeline.repositories.DoctorConsultancyLocationsRepository;
import com.sadi.pinklifeline.repositories.reviews.DoctorReviewsRepository;
import com.sadi.pinklifeline.utils.DbCleaner;
import lombok.extern.slf4j.Slf4j;
import org.assertj.core.util.Arrays;
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
import org.springframework.test.web.servlet.ResultActions;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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

    @Autowired
    private DoctorReviewsRepository reviewsRepository;

    @AfterEach
    public void cleanDb() {
        dbCleaner.clearDatabase();
    }

    @Test
    @Sql("/test/doctor_specific_features_test/add2Doctors.sql")
    public void doctorConsultancyLocationAddUpdateDeleteTest() throws Exception {
        Long id = 2L;
        Long newLocationId = 1L;
        String token = mint(id, List.of(Roles.ROLE_DOCTOR));

        String requestBody = """
                {
                  "location":"sonadanga 2nd phase, Khulna",
                  "start":"07:43:23",
                  "end":"16:43:23",
                  "workdays":"1111110",
                  "fees": 500
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
        assertEquals(req.getFees(), loc.get().getFees());

        String updateToken = mint(id, List.of(Roles.ROLE_DOCTOR));

        String updateBody = """
                {
                  "location":"Rohan 3rd phase, Khulna",
                  "start":"08:43:23",
                  "end":"12:43:23",
                  "workdays":"1110110",
                  "fees": 700
                }
                """;
        mockMvc.perform(put("/v1/ROLE_DOCTOR/{id}/locations/{newLocationId}", id, newLocationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", updateToken))
                        .content(updateBody))
                        .andExpect(status().isNoContent());

        DoctorLocationReq updateReq = objectMapper.readValue(updateBody, DoctorLocationReq.class);
        log.info("Doctor location Req: {}", updateReq);
        Optional<DoctorConsultationLocation> updatedLoc = locationsRepository.findById(newLocationId);
        if(updatedLoc.isEmpty()) {
            fail("Updated Doctor got removed");
        }
        log.info("Newly added doctor location: {}", updatedLoc.get());

        assertEquals(updateReq.getLocation(), updatedLoc.get().getLocation());
        assertEquals(updateReq.getStart(), updatedLoc.get().getStart());
        assertEquals(updateReq.getEnd(), updatedLoc.get().getEnd());
        assertEquals(updateReq.getWorkdays(), updatedLoc.get().getWorkdays());
        assertEquals(updateReq.getFees(), updatedLoc.get().getFees());

        String deleteToken = mint(id, List.of(Roles.ROLE_DOCTOR));

        mockMvc.perform(delete("/v1/ROLE_DOCTOR/{id}/locations/{newLocationId}", id, newLocationId)
                        .header("Authorization", String.format("Bearer %s", deleteToken)))
                        .andExpect(status().isNoContent());
        Optional<DoctorConsultationLocation> deletedLoc = locationsRepository.findById(newLocationId);
        if(deletedLoc.isPresent()) {
            fail("Deleted Doctor was not removed");
        }
    }

    @Test
    @Sql("/test/doctor_specific_features_test/add2Doctors.sql")
    public void doctorReviewAddUpdateDeleteTest() throws Exception {
        Long id = 2L;
        Long reviewId = 1L;
        String token = mint(id, List.of(Roles.ROLE_DOCTOR));

        String requestBody = """
                {
                  "id":3,
                  "rating":5,
                  "comment": "A very good doctor"
                }
                """;

        ResultActions resultActions = mockMvc.perform(post("/v1/reviews/doctor/{id}", id).contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", token))
                        .content(requestBody));
        resultActions.andExpect(status().isCreated());
        String review = resultActions.andReturn().getResponse().getHeader("Location");
        matchReviewSummary(resultActions, Arrays.array(0, 0, 0, 0, 1), 5.0, 1);

        log.info("Added Doctor Review URI: {}", review);
        DoctorReviewReq req = objectMapper.readValue(requestBody, DoctorReviewReq.class);
        log.info("Doctor review Req: {}", req);
        Optional<DoctorReview> rev = reviewsRepository.findById(reviewId);
        if(rev.isEmpty()) {
            fail("New Doctor Review was not added");
        }
        log.info("Newly added doctor review: {}", rev.get());

        assertEquals(req.getComment(), rev.get().getComment());
        assertEquals(req.getRating(), rev.get().getRating());
        assertEquals(req.getId(), rev.get().getDoctorDetails().getUserId());
        assertEquals(id, rev.get().getReviewer().getId());

        String updateToken = mint(id, List.of(Roles.ROLE_DOCTOR));

        String updateBody = """
                {
                  "rating":3,
                  "comment": "Tata bye bye"
                }
                """;

        resultActions = mockMvc.perform(put("/v1/reviews/doctor/{id}/{reviewId}", id, reviewId).contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", updateToken))
                .content(updateBody));
        resultActions.andExpect(status().isOk());
        matchReviewSummary(resultActions, Arrays.array(0, 0, 1, 0, 0), 3.0, 1);

        DoctorReviewReq updateReq = objectMapper.readValue(updateBody, DoctorReviewReq.class);
        log.info("Doctor review Update Req: {}", updateReq);
        rev = reviewsRepository.findById(reviewId);
        if(rev.isEmpty()) {
            fail("Update review deleted the review");
        }
        log.info("Newly update doctor review: {}", rev.get());

        assertEquals(updateReq.getComment(), rev.get().getComment());
        assertEquals(updateReq.getRating(), rev.get().getRating());

        String deleteToken = mint(id, List.of(Roles.ROLE_DOCTOR));

        resultActions = mockMvc.perform(delete("/v1/reviews/doctor/{id}/{reviewId}", id, reviewId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .header("Authorization", String.format("Bearer %s", deleteToken)));
        resultActions.andExpect(status().isOk());
        matchReviewSummary(resultActions, Arrays.array(0, 0, 0, 0, 0), 0.0, 0);
        rev = reviewsRepository.findById(reviewId);
        if(rev.isPresent()){
            fail("Review was not deleted");
        }
    }

    private void matchReviewSummary(ResultActions resultActions, Integer[] values, Double avg, Integer count) throws Exception {
        resultActions.andExpect(jsonPath("$.count").value(count))
                .andExpect(jsonPath("$.averageRating").value(avg))
                .andExpect(jsonPath("$.ratingCount.length()").value(5))
                .andExpect(jsonPath("$.ratingCount[0]").value(values[0]))
                .andExpect(jsonPath("$.ratingCount[1]").value(values[1]))
                .andExpect(jsonPath("$.ratingCount[2]").value(values[2]))
                .andExpect(jsonPath("$.ratingCount[3]").value(values[3]))
                .andExpect(jsonPath("$.ratingCount[4]").value(values[4]));
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
