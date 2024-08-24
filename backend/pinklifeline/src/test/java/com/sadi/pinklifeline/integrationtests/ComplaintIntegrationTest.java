package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.icegreen.greenmail.util.GreenMailUtil;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.Complaint;
import com.sadi.pinklifeline.models.reqeusts.ComplaintReq;
import com.sadi.pinklifeline.repositories.BlogRepository;
import com.sadi.pinklifeline.repositories.ComplaintRepository;
import com.sadi.pinklifeline.repositories.forum.ForumAnswerRepository;
import com.sadi.pinklifeline.repositories.forum.ForumQuestionRepository;
import com.sadi.pinklifeline.utils.DbCleaner;
import jakarta.mail.internet.MimeMessage;
import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Slf4j
public class ComplaintIntegrationTest extends AbstractBaseIntegrationTest{
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
    private ComplaintRepository complaintRepository;
    @Autowired
    private ForumAnswerRepository forumAnswerRepository;
    @Autowired
    private BlogRepository blogRepository;
    @Autowired
    private ForumQuestionRepository forumQuestionRepository;

    @AfterEach
    public void cleanDb() {
        dbCleaner.clearDatabase();
        entityManager.clear();
    }

    @Test
    @Sql(value = "/test/complaintTest.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void addQueryResolveComplaint() throws Exception {
        Long userId = 21L;
        Long adminId = 1L;
        Long blogId = 5L;
        Long forumAnswerId = 2L;
        Long forumQuestionId = 6L;
        Long newComplainId = 5L;
        Long forumAnswerComplaintId = 4L;
        Long blogComplaintId = 1L;
        Long forumQuestionComplaintId = 3L;

        greenMail.purgeEmailFromAllMailboxes();

        String addNewComplaintRequest = String.format("""
                {
                  "resourceId": %d,
                  "type": "BLOG",
                  "category": "Dis-information",
                  "description": "This question is filled with mis-information"
                }
                """, blogId);
        String token = mint(userId, List.of(Roles.ROLE_PATIENT));
        String location = mockMvc.perform(post("/v1/complaints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", token))
                        .content(addNewComplaintRequest)).andExpect(status().isCreated())
                .andReturn().getResponse().getHeader("Location");

        log.info("New complaint is created at: {}", location);

        Optional<Complaint> newComplaint = complaintRepository.findById(newComplainId);

        if(newComplaint.isEmpty()){
            fail("Complaint was not created");
        }

        ComplaintReq req = objectMapper.readValue(addNewComplaintRequest, ComplaintReq.class);
        log.info("New add complaint req: {}", req.toString());
        log.info("New complaint is: {}", newComplaint.get());

        assertComplaint(req, newComplaint.get());
        assertEquals(userId, newComplaint.get().getUser().getId());

        // Test Query
        String adminToken = mint(adminId, List.of(Roles.ROLE_ADMIN));
        String res = mockMvc.perform(get("/v1/ROLE_ADMIN/complaints")
                        .header("Authorization", String.format("Bearer %s", adminToken))
                        .param("type", "BLOG")
                        .param("category", "Dis-information")
                        .param("startDate", "2024-08-12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(newComplainId))
                .andReturn().getResponse().getContentAsString();

        log.info("Response for first query for complaints: {}", res);

        // Test resolve complaints
        mockMvc.perform(delete("/v1/ROLE_ADMIN/complaints/{forumAnswerComplaintId}",  forumAnswerComplaintId)
                .header("Authorization", String.format("Bearer %s", adminToken))
                .param("violation", "true")
        ).andExpect(status().isNoContent());

        if(forumAnswerRepository.existsById(forumAnswerId)){
            fail("ForumAnswer was not removed");
        }
        if(complaintRepository.existsById(forumAnswerComplaintId)){
            fail("Complaint was not removed");
        }

        mockMvc.perform(delete("/v1/ROLE_ADMIN/complaints/{blogComplaintId}", blogComplaintId)
                .header("Authorization", String.format("Bearer %s", adminToken))
                .param("violation", "true")
        ).andExpect(status().isNoContent());

        if(blogRepository.existsById(blogId)){
            fail("Blog was not removed");
        }
        if(complaintRepository.existsById(blogComplaintId)){
            fail("Complaint was not removed");
        }

        mockMvc.perform(delete("/v1/ROLE_ADMIN/complaints/{forumQuestionComplaintId}", forumQuestionComplaintId)
                .header("Authorization", String.format("Bearer %s", adminToken))
                .param("violation", "true")
        ).andExpect(status().isNoContent());

        if(forumQuestionRepository.existsById(forumQuestionId)){
            fail("forum question was not removed");
        }
        if(complaintRepository.existsById(forumQuestionComplaintId)){
            fail("Complaint was not removed");
        }

        Thread.sleep(250);

        MimeMessage[] messages = greenMail.getReceivedMessages();
        Assertions.assertThat(messages.length).isEqualTo(6);

        for (var message: messages){
            log.info("Email received: {}", GreenMailUtil.getBody(message));
        }

    }

    public void assertComplaint(ComplaintReq req, Complaint complaint){
        assertEquals(req.getResourceId(), complaint.getResourceId());
        assertEquals(req.getType(), complaint.getType());
        assertEquals(req.getCategory(), complaint.getCategory());
        assertEquals(req.getDescription(), complaint.getDescription());
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
