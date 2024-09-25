package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.NotificationSubscription;
import com.sadi.pinklifeline.models.reqeusts.NotificationSubscriptionReq;
import com.sadi.pinklifeline.repositories.notifications.NotificationSubscriptionRepository;
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

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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
public class NotificationHandlerV1Tests extends AbstractBaseIntegrationTest{

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
    private NotificationSubscriptionRepository notificationSubscriptionRepository;

    @AfterEach
    public void cleanDb() {
        dbCleaner.clearDatabase();
        entityManager.clear();
    }

    @Test
    @Sql(value = "/test/notificationHandlerTests.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void addUpdateQueryDeleteNotificationSubscriptionTest() throws Exception {
        Long userId = 41L;
        Long notificationId = 1L;

        String notificationSubscriptionBody = """
                {
                  "endpoint": "https://wns2-pn1p.notify.windows.com/w/?token=BQYAAABgQ8mh7rugPiIxNmZ4hgbiVHkj9sQjKIyRFOaHv%2b97AVdiozLdYak4M6rwL%2fZissevscMQpF4%2b%2bUj0uzGcrApy0MdD7gKeKA02Eq9IfLAC4FQdW4Kn7TYjrWgoCq%2bLygG5CHEg1gJCvd1Du1LEXl0PRs3hdlI7fAy6v2%2buTxyEuGmpYuRhkp6v0wuLHxNLqCv3RPMQRN%2f2ZcxO%2f3Y9Qw5eLsrSY4%2byzVxsvCsNQFU17oNdd1CRyKAv%2fgN6zNVxS1zgQSRU4Dg3NSMWsRAXu6ZL1iX%2fz2IHyGR9c8XYq%2fOVJAqZcRWgKeS9SUOoRRv6UaM%3d",
                  "publicKey": "BAd_uwF2U_2kc-WgJN02lJK_8stF4b5DdPGy8c4ksYvDj8mq-oLQrRlywaA33LxwoYka6uZa5O-ZV0BoEXFK3mQ",
                  "auth": "O79IkqH5rNEYA2uefOu53Q",
                  "permissions": 1
                }
               """;

        String token = mint(userId, List.of(Roles.ROLE_PATIENT));

        String location = mockMvc.perform(post("/v1/notifications/subscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", token))
                        .content(notificationSubscriptionBody)).andExpect(status().isCreated())
                .andReturn().getResponse().getHeader("Location");

        log.info("New notification subscription is created at: {}", location);

        Optional<NotificationSubscription> subscription = notificationSubscriptionRepository.findById(notificationId);
        if(subscription.isEmpty()) {
            fail("Notification subscription was not created");
        }

        NotificationSubscriptionReq req = objectMapper.readValue(notificationSubscriptionBody, NotificationSubscriptionReq.class);
        log.info("New notification subscription req: {}", req.toString());
        log.info("New notification subscription is: {}", subscription.get());

        assertNotificationSubscription(req, subscription.get());
        assertEquals(userId, subscription.get().getUser().getId());

        // Get Notification subscription
        String res = mockMvc.perform(get("/v1/notifications/subscriptions")
                        .header("Authorization", String.format("Bearer %s", token))
                        .param("endpoint", URLEncoder.encode(req.getEndpoint(), StandardCharsets.UTF_8)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.permissions").value(req.getPermissions()))
                .andExpect(jsonPath("$.id").value(notificationId))
                .andReturn().getResponse().getContentAsString();

        log.info("Result of query: {}", res);

        Integer updatedPermissions = 3;

        String updateNotificationBody = String.format("""
                {
                  "permissions": %d
                }
                """, updatedPermissions);

        String updateToken = mint(userId, List.of(Roles.ROLE_PATIENT));

        mockMvc.perform(put("/v1/notifications/subscriptions/{notificationId}", notificationId)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", updateToken))
                .content(updateNotificationBody)).andExpect(status().isNoContent());

        subscription = notificationSubscriptionRepository.findById(notificationId);
        if(subscription.isEmpty()) {
            fail("Update Notification subscription has deleted the subscription");
        }

        req.setPermissions(updatedPermissions);

        log.info("Updated notification subscription is: {}", subscription.get());

        assertNotificationSubscription(req, subscription.get());
    }

    private void assertNotificationSubscription(NotificationSubscriptionReq req, NotificationSubscription notificationSubscription) {
        assertEquals(req.getEndpoint(), notificationSubscription.getEndpoint());
        assertEquals(req.getAuth(), notificationSubscription.getAuth());
        assertEquals(req.getPublicKey(), notificationSubscription.getPublicKey());
        assertEquals(req.getPermissions(), notificationSubscription.getPermissions());
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
