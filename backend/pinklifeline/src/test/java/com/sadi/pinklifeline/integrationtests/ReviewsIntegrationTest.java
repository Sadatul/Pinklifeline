package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.Review;
import com.sadi.pinklifeline.models.reqeusts.RegisterReviewReq;
import com.sadi.pinklifeline.models.reqeusts.ReviewUpdateReq;
import com.sadi.pinklifeline.service.AbstractReviewHandlerService;
import com.sadi.pinklifeline.service.doctor.DoctorReviewsService;
import com.sadi.pinklifeline.service.hospital.HospitalReviewsService;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Slf4j
public class ReviewsIntegrationTest extends AbstractBaseIntegrationTest{

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DbCleaner dbCleaner;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private DoctorReviewsService doctorReviewsService;
    @Autowired
    private HospitalReviewsService hospitalReviewsService;

    @AfterEach
    public void cleanDb() {
        dbCleaner.clearDatabase();
    }

    @Test
    @Sql("/test/review_test/doctorReviewTest.sql")
    public void doctorReviewAddUpdateDeleteTest() throws Exception {
        Long reviewerId = 23L;
        String token = mint(reviewerId, List.of(Roles.ROLE_DOCTOR));
        reviewBaseTest(reviewerId, 24L, token, "doctor", doctorReviewsService);
    }

    @Test
    @Sql("/test/review_test/hospitalReviewTest.sql")
    public void hospitalReviewAddUpdateDeleteTest() throws Exception {
        Long reviewerId = 25L;
        String token = mint(reviewerId, List.of(Roles.ROLE_DOCTOR));
        reviewBaseTest(reviewerId, 1L, token, "hospital", hospitalReviewsService);
    }

    void reviewBaseTest(Long reviewerId, Long resourceId,
                        String reviewerToken, String type, AbstractReviewHandlerService reviewHandlerService) throws Exception {
        String requestBody = String.format("""
                {
                  "id":%d,
                  "rating":5,
                  "comment": "A very good %s"
                }
                """, resourceId, type);

        ResultActions resultActions = mockMvc.perform(post("/v1/reviews/{type}/{reviewerId}", type, reviewerId)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", reviewerToken))
                .content(requestBody));
        resultActions.andExpect(status().isCreated());
        matchReviewSummary(resultActions, Arrays.array(0, 0, 0, 0, 1), 5.0, 1);

        String location = resultActions.andReturn().getResponse().getHeader("Location");

        log.info("New Review Location for {}: {}", type, location);

        Review rev = reviewHandlerService.getReview(1L);

        RegisterReviewReq req = objectMapper.readValue(requestBody, RegisterReviewReq.class);

        log.info("Add {} review Req: {}", type, req);
        log.info("Newly added {} review: {}", type, rev);

        assertEquals(req.getComment(), rev.getComment());
        assertEquals(req.getRating(), rev.getRating());
        assertEquals(req.getId(), rev.getResourceId());
        assertEquals(reviewerId, rev.getReviewerId());

        String updateBody = """
                {
                  "rating":3,
                  "comment": "Tata bye bye"
                }
                """;

        resultActions = mockMvc.perform(put("/v1/reviews/{type}/{reviewerId}/{reviewId}", type, reviewerId, 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", reviewerToken))
                .content(updateBody));
        resultActions.andExpect(status().isOk());
        matchReviewSummary(resultActions, Arrays.array(0, 0, 1, 0, 0), 3.0, 1);

        ReviewUpdateReq updateReq = objectMapper.readValue(updateBody, ReviewUpdateReq.class);

        log.info("Update {} review Req: {}", type, updateReq);

        // Matching the review update req with query
        String res = mockMvc.perform(get("/v1/reviews/{type}/{resourceId}", type, resourceId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", reviewerToken)))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.length()").value(1))
                        .andExpect(jsonPath("$[0].id").value(1L))
                        .andExpect(jsonPath("$[0].reviewerId").value(reviewerId))
                        .andExpect(jsonPath("$[0].rating").value(updateReq.getRating()))
                        .andExpect(jsonPath("$[0].comment").value(updateReq.getComment()))
                        .andReturn().getResponse().getContentAsString();

        log.info("Get reviews for {} with id {}: {}", type, resourceId, res);

        resultActions = mockMvc.perform(get("/v1/reviews/{type}/{resourceId}/summary", type, resourceId)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", reviewerToken)));

        res = resultActions.andReturn().getResponse().getContentAsString();

        log.info("Get reviews summary for {} with id {}: {}", type, resourceId, res);

        matchReviewSummary(resultActions, Arrays.array(0, 0, 1, 0, 0), 3.0, 1);

        resultActions = mockMvc.perform(delete("/v1/reviews/{type}/{reviewerId}/{reviewId}", type, reviewerId, 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", reviewerToken)));
        resultActions.andExpect(status().isOk());
        matchReviewSummary(resultActions, Arrays.array(0, 0, 0, 0, 0), 0.0, 0);

        assertThrows(ResourceNotFoundException.class,() -> reviewHandlerService.getReview(1L));
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
                .claim("scope", roles)
                .claim("subscribed", 0);
        JwtEncoderParameters parameters = JwtEncoderParameters.from(builder.build());
        return this.jwtEncoder.encode(parameters).getTokenValue();
    }
}
