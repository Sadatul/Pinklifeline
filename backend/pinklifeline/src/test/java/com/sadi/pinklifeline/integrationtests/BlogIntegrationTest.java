package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.Blog;
import com.sadi.pinklifeline.models.entities.BlogVote;
import com.sadi.pinklifeline.models.reqeusts.BlogReq;
import com.sadi.pinklifeline.repositories.BlogRepository;
import com.sadi.pinklifeline.service.BlogHandlerService;
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
import static org.hamcrest.CoreMatchers.nullValue;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Slf4j
public class BlogIntegrationTest extends AbstractBaseIntegrationTest{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private BlogHandlerService blogHandlerService;

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
    @Sql(value = "/test/blogTest.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void addUpdateQueryVoteDeleteBlogTest() throws Exception {
        Long userId = 15L;
        Long docId = 16L;
        Long newBlogId = 5L;
        Long newVoteId = 3L;

        String addBlogRequestBody = """
                {
                  "title": "Basic Cancer Surgery",
                  "content": "Lorem ipsum odor amet, consectetuer adipiscing elit. Tempor duis efficitur in viverra phasellus elit lacus. Metus purus bibendum vivamus hendrerit feugiat tristique hac. Massa dolor fames elit platea viverra, sociosqu aenean. Morbi lorem facilisi pharetra leo nisi nibh. Auctor facilisis pellentesque ex natoque pellentesque cras proin dignissim. Lacinia volutpat arcu etiam; justo at facilisi. Nulla blandit condimentum mauris odio pharetra sed mollis curae pellentesque. Class odio odio dictumst faucibus, adipiscing ligula."
                }
                """;

        String token = mint(docId, List.of(Roles.ROLE_DOCTOR));
        String location = mockMvc.perform(post("/v1/blogs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", token))
                        .content(addBlogRequestBody)).andExpect(status().isCreated())
                .andReturn().getResponse().getHeader("Location");

        log.info("New blog is created at: {}", location);

        Optional<Blog> newBlog = blogRepository.findById(newBlogId);

        if(newBlog.isEmpty()){
            fail("Blog was not created");
        }

        BlogReq req = objectMapper.readValue(addBlogRequestBody, BlogReq.class);
        log.info("New add blog req: {}", req.toString());
        log.info("New blog is: {}", newBlog.get());

        assertBlog(req, newBlog.get());
        assertEquals(docId, newBlog.get().getAuthor().getUserId());

        // Update Blog Test
        String updateBlogRequest = """
                {
                  "title": "Basic Cancer Surgery 2",
                  "content": "Lorem ipsum odor amet, consectetuer adipiscing elit. Tempor duis efficitur in landit cond2."
                }
                """;
        String updateToken = mint(docId, List.of(Roles.ROLE_DOCTOR));
        mockMvc.perform(put("/v1/blogs/{newBlogId}", newBlogId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", updateToken))
                        .content(updateBlogRequest)).andExpect(status().isNoContent());

        Optional<Blog> updateBlog = blogRepository.findById(newBlogId);

        if(updateBlog.isEmpty()){
            fail("Update has removed the blog post");
        }

        req = objectMapper.readValue(updateBlogRequest, BlogReq.class);

        log.info("Update blog req: {}", req.toString());
        log.info("Updated blog is: {}", updateBlog.get());

        assertBlog(req, updateBlog.get());

        // Vote Test
        String userToken = mint(userId, List.of(Roles.ROLE_PATIENT));
        mockMvc.perform(put("/v1/blogs/{newBlogId}/vote", newBlogId)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", userToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.voteChange").value(1));
        Optional<BlogVote> voteEntry = blogHandlerService.getVoteEntryForBlog(newBlogId, userId);
        if(voteEntry.isEmpty()){
            fail("Vote was not registered for blog");
        }
        log.info("Vote body: {}", voteEntry.get());
        assertEquals(newVoteId, voteEntry.get().getId());

        // Test vote count with query
        String res = mockMvc.perform(get("/v1/blogs")
                        .header("Authorization", String.format("Bearer %s", userToken))
                        .param("doctorName", "Raka")
                        .param("title", "Surgery")
                        .param("startDate", "2024-08-12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(newBlogId))
                .andExpect(jsonPath("$.content[0].upvoteCount").value(1))
                .andExpect(jsonPath("$.content[0].voteId").value(newVoteId))
                .andReturn().getResponse().getContentAsString();

        log.info("Response for first query for blog: {}", res);

        // Un-Vote Test
        mockMvc.perform(put("/v1/blogs/{newBlogId}/vote", newBlogId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", userToken)))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.voteChange").value(-1));
        voteEntry = blogHandlerService.getVoteEntryForBlog(newBlogId, userId);
        if(voteEntry.isPresent()){
            fail("Vote is still registered after undoing vote");
        }

        res = mockMvc.perform(get("/v1/blogs/{newBlogId}", newBlogId)
                .header("Authorization", String.format("Bearer %s", userToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authorId").value(docId))
                .andExpect(jsonPath("$.upvoteCount").value(0))
                .andExpect(jsonPath("$.voteId", nullValue()))
                .andReturn().getResponse().getContentAsString();
        log.info("Response for second query for blog (get blog by id): {}", res);
        // Delete Blog Test
        String deleteToken = mint(docId, List.of(Roles.ROLE_DOCTOR));
        mockMvc.perform(delete("/v1/blogs/{newBlogId}", newBlogId)
                .header("Authorization", String.format("Bearer %s", deleteToken)))
                .andExpect(status().isNoContent());

        Optional<Blog> deletedBlog = blogRepository.findById(newBlogId);
        if(deletedBlog.isPresent()){
            fail("Blog was not deleted");
        }
        // Anonymous user tests
        Long existingBlogId = 1L;
        res = mockMvc.perform(get("/v1/anonymous/blogs")
                        .param("doctorName", "Raka")
                        .param("title", "how")
                        .param("startDate", "2024-05-01")
                        .param("endDate", "2024-05-30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(existingBlogId))
                .andExpect(jsonPath("$.content[0].upvoteCount").value(0))
                .andExpect(jsonPath("$.content[0].voteId", nullValue()))
                .andReturn().getResponse().getContentAsString();

        log.info("Response for first query for blog by anonymous: {}", res);
        res = mockMvc.perform(get("/v1/anonymous/blogs/{existingBlogId}", existingBlogId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authorId").value(docId))
                .andExpect(jsonPath("$.upvoteCount").value(0))
                .andExpect(jsonPath("$.voteId", nullValue()))
                .andReturn().getResponse().getContentAsString();
        log.info("Response for second query for blog (get blog by id) by anonymous: {}", res);
    }

    private void assertBlog(BlogReq req, Blog blog) {
        assertEquals(req.getTitle(), blog.getTitle());
        assertEquals(req.getContent(), blog.getContent());
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
