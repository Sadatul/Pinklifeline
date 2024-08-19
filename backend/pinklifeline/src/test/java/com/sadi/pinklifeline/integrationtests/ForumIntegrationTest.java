package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.ForumAnswer;
import com.sadi.pinklifeline.models.entities.ForumAnswerVote;
import com.sadi.pinklifeline.models.entities.ForumQuestion;
import com.sadi.pinklifeline.models.entities.ForumQuestionVote;
import com.sadi.pinklifeline.models.reqeusts.ForumAnswerReq;
import com.sadi.pinklifeline.models.reqeusts.ForumQuestionReq;
import com.sadi.pinklifeline.repositories.forum.ForumAnswerRepository;
import com.sadi.pinklifeline.repositories.forum.ForumQuestionRepository;
import com.sadi.pinklifeline.service.forum.ForumAnswerHandlerService;
import com.sadi.pinklifeline.service.forum.ForumQuestionHandlerService;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.CoreMatchers.nullValue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Slf4j
public class ForumIntegrationTest extends AbstractBaseIntegrationTest{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DbCleaner dbCleaner;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private ForumQuestionRepository forumQuestionRepository;
    @Autowired
    private ForumQuestionHandlerService forumQuestionHandlerService;
    @Autowired
    private ForumAnswerRepository forumAnswerRepository;
    @Autowired
    private ForumAnswerHandlerService forumAnswerHandlerService;

    @AfterEach
    public void cleanDb() {
        dbCleaner.clearDatabase();
        entityManager.clear();
    }

    @Test
    @Sql(value = "/test/forum_test/forumQuestionTest.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void addUpdateQueryVoteDeleteForumTest() throws Exception {
        Long userId = 17L;
        Long docId = 18L;
        Long newForumId = 5L;
        Long newVoteId = 3L;

        String addForumQuestionRequest = """
                {
                  "title": "Basic Cancer Surgery",
                  "body": "Lorem ipsum odor amet, consectetuer adipiscing elit. Tempor duis efficitur in viverra phasellus elit lacus. Metus purus bibendum vivamus hendrerit feugiat tristique hac. Massa dolor fames elit platea viverra, sociosqu aenean. Morbi lorem facilisi pharetra leo nisi nibh. Auctor facilisis pellentesque ex natoque pellentesque cras proin dignissim. Lacinia volutpat arcu etiam; justo at facilisi. Nulla blandit condimentum mauris odio pharetra sed mollis curae pellentesque. Class odio odio dictumst faucibus, adipiscing ligula.",
                  "tags": ["Digital", "Social Media"]
                }
                """;

        String token = mint(docId, List.of(Roles.ROLE_DOCTOR));
        String location = mockMvc.perform(post("/v1/forum")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", token))
                        .content(addForumQuestionRequest)).andExpect(status().isCreated())
                .andReturn().getResponse().getHeader("Location");

        log.info("New forum question is created at: {}", location);

        Optional<ForumQuestion> newForumQuestion = forumQuestionRepository.findById(newForumId);

        if(newForumQuestion.isEmpty()){
            fail("Forum question was not created");
        }

        ForumQuestionReq req = objectMapper.readValue(addForumQuestionRequest, ForumQuestionReq.class);
        log.info("New add forum question req: {}", req.toString());
        log.info("New forum question is: {}", newForumQuestion.get());

        assertForumQuestion(req, newForumQuestion.get());
        assertEquals(docId, newForumQuestion.get().getUser().getId());

        String updateForumQuestionRequest = """
                {
                  "title": "Basic Cancer Surgery 2",
                  "body": "Lorem ipsum odor amet, consectetuer adipiscing elit. Tempor duis efficitur in landit cond2.",
                  "tags": ["Delta", "treatment", "cancer"]
                }
                """;
        String updateToken = mint(docId, List.of(Roles.ROLE_DOCTOR));
        mockMvc.perform(put("/v1/forum/{newForumId}", newForumId)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", updateToken))
                .content(updateForumQuestionRequest)).andExpect(status().isNoContent());

        Optional<ForumQuestion> updateForumQuestion = forumQuestionRepository.findById(newForumId);

        if(updateForumQuestion.isEmpty()){
            fail("Update has removed the forum question");
        }

        req = objectMapper.readValue(updateForumQuestionRequest, ForumQuestionReq.class);

        log.info("Update forum question req: {}", req.toString());
        log.info("Updated forum question is: {}", updateForumQuestion.get());

        assertForumQuestion(req, updateForumQuestion.get());

        // Up-Vote Test
        String userToken = mint(userId, List.of(Roles.ROLE_PATIENT));
        mockMvc.perform(put("/v1/forum/{newForumId}/vote", newForumId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                          {
                            "voteType":"UPVOTE"
                          }
                        """)
                        .header("Authorization", String.format("Bearer %s", userToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.voteChange").value(1));
        Optional<ForumQuestionVote> voteEntry = forumQuestionHandlerService.getVoteEntryByQuestionIdAndUserId(newForumId, userId);
        if(voteEntry.isEmpty()){
            fail("Vote was not registered for Forum question");
        }
        log.info("Vote body: {}", voteEntry.get());
        assertEquals(newVoteId, voteEntry.get().getId());
        assertEquals(1, voteEntry.get().getValue());

        // Test vote count with query
        String res = mockMvc.perform(get("/v1/forum")
                        .header("Authorization", String.format("Bearer %s", userToken))
                        .param("title", "Surgery")
                        .param("tags", "cancer,treatment")
                        .param("startDate", "2024-08-12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(newForumId))
                .andExpect(jsonPath("$.content[0].voteCount").value(1))
                .andExpect(jsonPath("$.content[0].voteByUser").value(1))
                .andReturn().getResponse().getContentAsString();

        log.info("Response for first query for forum question: {}", res);

        // Down Vote test
        mockMvc.perform(put("/v1/forum/{newForumId}/vote", newForumId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                          {
                            "voteType":"DOWNVOTE"
                          }
                        """)
                        .header("Authorization", String.format("Bearer %s", userToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.voteChange").value(-2));

        voteEntry = forumQuestionHandlerService.getVoteEntryByQuestionIdAndUserId(newForumId, userId);
        if(voteEntry.isEmpty()){
            fail("Vote was not registered for Forum question");
        }
        log.info("Vote body: {}", voteEntry.get());
        assertEquals(newVoteId, voteEntry.get().getId());
        assertEquals(-1, voteEntry.get().getValue());

        res = mockMvc.perform(get("/v1/forum/{newForumId}", newForumId)
                        .header("Authorization", String.format("Bearer %s", userToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authorId").value(docId))
                .andExpect(jsonPath("$.voteCount").value(-1))
                .andExpect(jsonPath("$.voteByUser").value(-1))
                .andReturn().getResponse().getContentAsString();
        log.info("Response for second query for forum question (get question by id): {}", res);
        // Delete Question Test
        String deleteToken = mint(docId, List.of(Roles.ROLE_DOCTOR));
        mockMvc.perform(delete("/v1/forum/{newForumId}", newForumId)
                        .header("Authorization", String.format("Bearer %s", deleteToken)))
                .andExpect(status().isNoContent());

        Optional<ForumQuestion> deletedQuestion = forumQuestionRepository.findById(newForumId);
        if(deletedQuestion.isPresent()){
            fail("Forum Question was not deleted");
        }
        // Anonymous Test
        Long existingForumQuestion = 1L;
        res = mockMvc.perform(get("/v1/anonymous/forum")
                        .param("title", "how")
                        .param("tags", "cancer,treatment")
                        .param("startDate", "2024-05-01")
                        .param("endDate", "2024-05-30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(existingForumQuestion))
                .andExpect(jsonPath("$.content[0].voteCount").value(0))
                .andExpect(jsonPath("$.content[0].voteByUser", nullValue()))
                .andReturn().getResponse().getContentAsString();

        log.info("Response for first query for forum question by anonymous user: {}", res);

        res = mockMvc.perform(get("/v1/anonymous/forum/{existingForumQuestion}", existingForumQuestion))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authorId").value(docId))
                .andExpect(jsonPath("$.voteCount").value(0))
                .andExpect(jsonPath("$.voteByUser", nullValue()))
                .andReturn().getResponse().getContentAsString();
        log.info("Response for second query for forum question (get question by id): {}", res);
    }

    @Test
    @Sql(value = "/test/forum_test/forumAnswerTest.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void addUpdateQueryVoteDeleteForumAnswerTest() throws Exception {
        Long userId = 19L;
        Long docId = 20L;
        Long questionId = 5L;
        Long oldAnswerId = 1L;
        Long newAnswerId = 2L;
        Long newVoteId = 1L;

        String addForumAnswerRequest = String.format("""
                {
                  "questionId": %d,
                  "parentId": %d,
                  "body": "Lorem ipsum odor amet, consectetuer adipiscing elit. Tempor duis efficitur in viverra phasellus elit lacus. Metus purus bibendum vivamus hendrerit feugiat tristique hac. Massa dolor fames elit platea viverra, sociosqu aenean. Morbi lorem facilisi pharetra leo nisi nibh. Auctor facilisis pellentesque ex natoque pellentesque cras proin dignissim. Lacinia volutpat arcu etiam; justo at facilisi. Nulla blandit condimentum mauris odio pharetra sed mollis curae pellentesque. Class odio odio dictumst faucibus, adipiscing ligula."
                }
                """, questionId, oldAnswerId);

        String token = mint(docId, List.of(Roles.ROLE_DOCTOR));
        String location = mockMvc.perform(post("/v1/forum/answers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", token))
                        .content(addForumAnswerRequest)).andExpect(status().isCreated())
                .andReturn().getResponse().getHeader("Location");

        log.info("New forum answer is created at: {}", location);

        Optional<ForumAnswer> newForumAnswer = forumAnswerRepository.findById(newAnswerId);

        if(newForumAnswer.isEmpty()){
            fail("Forum answer was not created");
        }

        ForumAnswerReq req = objectMapper.readValue(addForumAnswerRequest, ForumAnswerReq.class);
        log.info("New add forum answer req: {}", req.toString());
        log.info("New forum answer is: {}", newForumAnswer.get());

        assertForumAnswer(req, newForumAnswer.get());
        assertEquals(docId, newForumAnswer.get().getUser().getId());

        String body = "How can this be? Why is this not a dream?";

        String updateToken = mint(docId, List.of(Roles.ROLE_DOCTOR));
        mockMvc.perform(put("/v1/forum/answers/{newAnswerId}", newAnswerId)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", updateToken))
                .content(String.format("""
                        {
                            "body": "%s"
                        }
                        """, body))).andExpect(status().isNoContent());

        Optional<ForumAnswer> updatedForumAnswer = forumAnswerRepository.findById(newAnswerId);

        if(updatedForumAnswer.isEmpty()){
            fail("Update has removed the forum answer");
        }

        log.info("Updated forum answer is: {}", updatedForumAnswer.get());

        assertEquals(body, updatedForumAnswer.get().getBody());
        // Up-Vote Test
        String userToken = mint(userId, List.of(Roles.ROLE_PATIENT));
        mockMvc.perform(put("/v1/forum/answers/{newAnswerId}/vote", newAnswerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                          {
                            "voteType":"UPVOTE"
                          }
                        """)
                        .header("Authorization", String.format("Bearer %s", userToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.voteChange").value(1));
        Optional<ForumAnswerVote> voteEntry = forumAnswerHandlerService.getVoteEntryByAnswerIdAndUserId(newAnswerId, userId);
        if(voteEntry.isEmpty()){
            fail("Vote was not registered for Forum answer");
        }
        log.info("Vote answer body: {}", voteEntry.get());
        assertEquals(newVoteId, voteEntry.get().getId());
        assertEquals(1, voteEntry.get().getValue());

        // Test vote count with query
        String res = mockMvc.perform(get("/v1/forum/answers")
                        .header("Authorization", String.format("Bearer %s", userToken))
                        .param("questionId", questionId.toString())
                        .param("parentId", oldAnswerId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(newAnswerId))
                .andExpect(jsonPath("$[0].voteCount").value(1))
                .andExpect(jsonPath("$[0].voteByUser").value(1))
                .andReturn().getResponse().getContentAsString();

        log.info("Response for first query for forum answer: {}", res);
        // Delete Answer
        String deleteToken = mint(docId, List.of(Roles.ROLE_DOCTOR));
        mockMvc.perform(delete("/v1/forum/answers/{newAnswerId}", newAnswerId)
                        .header("Authorization", String.format("Bearer %s", deleteToken)))
                .andExpect(status().isNoContent());

        Optional<ForumAnswer> deletedAnswer = forumAnswerRepository.findById(newAnswerId);
        if(deletedAnswer.isPresent()){
            fail("Answer was not deleted");
        }
        // Anonymous user test
        Long existingAnswerId = 1L;
        res = mockMvc.perform(get("/v1/anonymous/forum/answers")
                        .param("questionId", questionId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(existingAnswerId))
                .andExpect(jsonPath("$[0].voteCount").value(0))
                .andExpect(jsonPath("$[0].voteByUser", nullValue()))
                .andReturn().getResponse().getContentAsString();
        log.info("Response for first query for forum answer by anonymous user: {}", res);
    }

    private void assertForumQuestion(ForumQuestionReq req, ForumQuestion question){
        assertEquals(req.getTitle(), question.getTitle());
        assertEquals(req.getBody(), question.getBody());
        assertArrayEquals(req.getTags().toArray(new String[0]), question.getTags().toArray(new String[0]));
    }

    private void assertForumAnswer(ForumAnswerReq req, ForumAnswer answer){
        assertEquals(req.getBody(), answer.getBody());
        assertEquals(req.getParentId(), answer.getParentAnswer().getId());
        assertEquals(req.getQuestionId(), answer.getQuestion().getId());
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
