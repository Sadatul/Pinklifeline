package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.icegreen.greenmail.util.GreenMailUtil;
import com.sadi.pinklifeline.enums.PaidWorkStatus;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.enums.SubscriptionType;
import com.sadi.pinklifeline.enums.WorkTag;
import com.sadi.pinklifeline.models.entities.PaidWork;
import com.sadi.pinklifeline.models.reqeusts.PaidWorkReq;
import com.sadi.pinklifeline.repositories.PaidWorkRepository;
import com.sadi.pinklifeline.service.PaidWorkHandlerService;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Slf4j
public class PaidWorkIntegrationTest extends AbstractBaseIntegrationTest{
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
    private PaidWorkRepository paidWorkRepository;
    @Autowired
    private PaidWorkHandlerService paidWorkHandlerService;

    @AfterEach
    public void cleanDb() {
        dbCleaner.clearDatabase();
        entityManager.clear();
    }

    @Test
    @Sql(value = "/test/paid_work/paidWork.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void addUpdateReserveDeletePaidWorkTest() throws Exception {
        greenMail.purgeEmailFromAllMailboxes();

        Long userId = 27L;
        Long providerId = 26L;
        Long existingWorkId = 1L;
        Long newWorkId = 2L;

        String addWorkRequest = """
                {
                  "title": "My sister needs chemo",
                  "description": "add me go ",
                  "address": "Chittagong, Bangladesh",
                  "tags": ["NURSING"]
                }
                """;

        String token = mint(userId, List.of(Roles.ROLE_PATIENT), 0);

        String location = mockMvc.perform(post("/v1/works")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", token))
                        .content(addWorkRequest)).andExpect(status().isCreated())
                        .andReturn().getResponse().getHeader("Location");

        log.info("New paid work is created at: {}", location);

        Optional<PaidWork> newPaidWork = paidWorkRepository.findById(newWorkId);

        if(newPaidWork.isEmpty()){
            fail("Paid Work was not created");
        }

        PaidWorkReq req = objectMapper.readValue(addWorkRequest, PaidWorkReq.class);
        log.info("New add work req: {}", req.toString());
        log.info("New work is: {}", newPaidWork.get());

        asserWork(req, newPaidWork.get());
        assertEquals(userId, newPaidWork.get().getUser().getId());

        String updateWorkRequest = """
                {
                  "title": "My sister needs chemo and help",
                  "description": "add me go goa",
                  "address": "Osaka, Bangladesh",
                  "tags": ["DOCTOR"]
                }
                """;

        String updateToken = mint(userId, List.of(Roles.ROLE_PATIENT), 0);

        mockMvc.perform(put("/v1/works/{newWorkId}", newWorkId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", updateToken))
                        .content(updateWorkRequest)).andExpect(status().isNoContent());

        Optional<PaidWork> updatedWork = paidWorkRepository.findById(newWorkId);

        if(updatedWork.isEmpty()){
            fail("Paid Work was deleted after update");
        }

        req = objectMapper.readValue(updateWorkRequest, PaidWorkReq.class);
        log.info("update work req: {}", req.toString());
        log.info("Updated work is: {}", updatedWork.get());

        asserWork(req, updatedWork.get());

        String docToken = mint(providerId, List.of(Roles.ROLE_DOCTOR), SubscriptionType.DOCTOR_MONTHLY.getValue());
        mockMvc.perform(put("/v1/works/{newWorkId}/reserve", newWorkId)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", docToken)))
                .andExpect(status().isNoContent());

        newPaidWork = paidWorkRepository.findById(newWorkId);

        if(newPaidWork.isEmpty()){
            fail("Paid Work was deleted after reserve");
        }
        log.info("Reserved work is: {}", newPaidWork.get());
        assertEquals(providerId, newPaidWork.get().getHealCareProvider().getUserId());
        assertEquals(PaidWorkStatus.ACCEPTED, newPaidWork.get().getStatus());

        mockMvc.perform(delete("/v1/works/{newWorkId}/reserve", newWorkId)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", docToken)))
                .andExpect(status().isNoContent());

        newPaidWork = paidWorkRepository.findById(newWorkId);

        if(newPaidWork.isEmpty()){
            fail("Paid Work was deleted after removing reserve");
        }
        log.info("work after removing reserve: {}", newPaidWork.get());
        assertNull(newPaidWork.get().getHealCareProvider());
        assertEquals(PaidWorkStatus.POSTED, newPaidWork.get().getStatus());

        String deleteToken = mint(userId, List.of(Roles.ROLE_PATIENT), 0);
        mockMvc.perform(delete("/v1/works/{newWorkId}", newWorkId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", deleteToken)))
                        .andExpect(status().isNoContent());

        if(paidWorkRepository.existsById(newWorkId)){
            fail("Paid Work was not deleted");
        }

        mockMvc.perform(put("/v1/works/{existingWorkId}/finish", existingWorkId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", deleteToken)))
                        .andExpect(status().isNoContent());

        newPaidWork = paidWorkRepository.findById(existingWorkId);

        if(newPaidWork.isEmpty()){
            fail("Paid Work was deleted after finishing");
        }
        log.info("Finished work: {}", newPaidWork.get());
        assertEquals(providerId, newPaidWork.get().getHealCareProvider().getUserId());
        assertEquals(PaidWorkStatus.FINISHED, newPaidWork.get().getStatus());

        Thread.sleep(250);

        MimeMessage[] messages = greenMail.getReceivedMessages();
        Assertions.assertThat(messages.length).isEqualTo(3);

        for (var message: messages){
            log.info("Email received: {}", GreenMailUtil.getBody(message));
        }
    }

    @Test
    @Sql(value = "/test/paid_work/getPaidWork.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void getPaidWorkTest() throws Exception {
        Long userId = 29L;
        Long providerId = 28L;
        Long acceptedWorkId = 2L;
        Long selectedId = 3L;

        String providerTokenUnPaid = mint(providerId, List.of(Roles.ROLE_DOCTOR), 0);
        String providerTokenPaid = mint(providerId, List.of(Roles.ROLE_DOCTOR), SubscriptionType.DOCTOR_YEARLY.getValue());
        String userToken = mint(userId, List.of(Roles.ROLE_PATIENT), 0);

        String res = mockMvc.perform(get("/v1/works")
                        .header("Authorization", String.format("Bearer %s", providerTokenUnPaid))
                        .param("startDate", "2024-07-01")
                        .param("endDate", "2024-07-28")
                        .param("tags", "NURSING")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(selectedId))
                .andExpect(jsonPath("$.content[0].address").doesNotExist())
                .andReturn().getResponse().getContentAsString();
        log.info("First response: {}", res);

        res = mockMvc.perform(get("/v1/works")
                        .header("Authorization", String.format("Bearer %s", providerTokenPaid))
                        .param("address", "dhaka")
                        .param("tags", "NURSING")
                        .param("sortDirection", "ASC")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(2))
                .andExpect(jsonPath("$.content[1].id").value(selectedId))
                .andExpect(jsonPath("$.content[0].id").value(4L))
                .andExpect(jsonPath("$.content[1].address").exists())
                .andExpect(jsonPath("$.content[0].address").exists())
                .andReturn().getResponse().getContentAsString();
        log.info("Second response: {}", res);

        res = mockMvc.perform(get("/v1/works/{acceptedWorkId}", acceptedWorkId)
                        .header("Authorization", String.format("Bearer %s", userToken))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(acceptedWorkId))
                .andExpect(jsonPath("$.userId").value(userId))
                .andExpect(jsonPath("$.providerId").value(providerId))
                .andExpect(jsonPath("$.address").exists())
                .andReturn().getResponse().getContentAsString();
        log.info("Third response: {}", res);

        res = mockMvc.perform(get("/v1/works/{acceptedWorkId}", acceptedWorkId)
                        .header("Authorization", String.format("Bearer %s", providerTokenUnPaid))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(acceptedWorkId))
                .andExpect(jsonPath("$.userId").value(userId))
                .andExpect(jsonPath("$.providerId").value(providerId))
                .andExpect(jsonPath("$.address").exists())
                .andReturn().getResponse().getContentAsString();
        log.info("Fourth response: {}", res);

        res = mockMvc.perform(get("/v1/works/{acceptedWorkId}", selectedId)
                        .header("Authorization", String.format("Bearer %s", providerTokenUnPaid))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(selectedId))
                .andExpect(jsonPath("$.userId").doesNotExist())
                .andExpect(jsonPath("$.providerId").doesNotExist())
                .andExpect(jsonPath("$.address").doesNotExist())
                .andExpect(jsonPath("$.tags.length()").value(2))
                .andReturn().getResponse().getContentAsString();
        log.info("Fifth response: {}", res);

        res = mockMvc.perform(get("/v1/works/{acceptedWorkId}", selectedId)
                        .header("Authorization", String.format("Bearer %s", providerTokenPaid))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(selectedId))
                .andExpect(jsonPath("$.userId").doesNotExist())
                .andExpect(jsonPath("$.providerId").doesNotExist())
                .andExpect(jsonPath("$.tags.length()").value(2))
                .andExpect(jsonPath("$.address").exists())
                .andReturn().getResponse().getContentAsString();
        log.info("Sixth response: {}", res);

        mockMvc.perform(get("/v1/works/{acceptedWorkId}/tags", selectedId)
                        .header("Authorization", String.format("Bearer %s", providerTokenPaid))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0]").value("NURSING"))
                .andExpect(jsonPath("$[1]").value("DOCTOR"));
    }

    private void asserWork(PaidWorkReq req, PaidWork newPaidWork) {
        assertEquals(req.getTitle(), newPaidWork.getTitle());
        assertEquals(req.getDescription(), newPaidWork.getDescription());
        assertEquals(req.getAddress(), newPaidWork.getAddress());
        assertArrayEquals(req.getTags().toArray(new WorkTag[0]), paidWorkHandlerService.getWorkTags(newPaidWork.getId())
                .toArray(new WorkTag[0]));
        assertEquals(PaidWorkStatus.POSTED, newPaidWork.getStatus());
        assertNull(newPaidWork.getHealCareProvider());
    }

    private String mint(Long id, List<Roles> roles, int subscribed){
        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .subject(id.toString())
                .issuer("self")
                .audience(List.of("pinklifeline"))
                .claim("scope", roles)
                .claim("subscribed", subscribed);
        JwtEncoderParameters parameters = JwtEncoderParameters.from(builder.build());
        return this.jwtEncoder.encode(parameters).getTokenValue();
    }
}
