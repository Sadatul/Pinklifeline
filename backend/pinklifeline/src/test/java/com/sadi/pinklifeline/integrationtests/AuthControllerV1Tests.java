package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.icegreen.greenmail.store.FolderException;
import com.icegreen.greenmail.util.GreenMailUtil;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.UnverifiedUser;
import com.sadi.pinklifeline.models.User;
import com.sadi.pinklifeline.repositories.UserRepository;
import com.sadi.pinklifeline.repositories.UserVerificationRepository;
import jakarta.mail.internet.MimeMessage;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Rollback
@Transactional
public class AuthControllerV1Tests extends AbstractBaseIntegrationTest{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository  userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserVerificationRepository userVerRepo;

    @Autowired
    private ObjectMapper objectMapper;

    private final Logger logger = LoggerFactory.getLogger(AuthControllerV1Tests.class);

    @BeforeEach
    void setUp() throws FolderException {
        greenMail.purgeEmailFromAllMailboxes();
    }

    @Test
    public void givenUsernamePassword_whenAuthenticated_ReturnJwtToken() throws Exception {
        User newUser = new User("pinklife@example.com", passwordEncoder.encode("12345"),
                List.of(Roles.ROLE_PATIENT));

       userRepository.save(newUser);

        ResultActions resultActions = mockMvc.perform(post("/v1/auth").contentType(MediaType.APPLICATION_JSON)
                .content("""
                  {
                    "username": "pinklife@example.com",
                    "password": "12345"
                  }
                 """));

        String response = resultActions.andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.userId").exists())
                .andReturn().getResponse().getContentAsString();

        TypeReference<Map<String, String>> typeRef = new TypeReference<>() {};
        Map<String, String> token = objectMapper.readValue(response, typeRef);

        mockMvc.perform(get("/v1/hello").contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", token.get("token"))))
                .andExpect(status().isOk());
    }

    @Test
    public void givenWrongUsernamePassword_whenAuthenticated_willReturnUnAuthorized() throws Exception {
        User newUser = new User("pinklife@example.com", passwordEncoder.encode("12345"),
                List.of(Roles.ROLE_PATIENT));

        userRepository.save(newUser);

        ResultActions resultActions = mockMvc.perform(post("/v1/auth").contentType(MediaType.APPLICATION_JSON)
                .content("""
                  {
                    "username": "pinklife@example.com",
                    "password": "1235"
                  }
                 """));

       resultActions.andExpect(status().isUnauthorized());
    }

    @Test
    public void givenDetails_whenRegister_willCreateNewUser() throws Exception {
        String username = "pinklife@example.com";
        String password = "pink@1";
        String role = Roles.ROLE_PATIENT.toString();

        mockMvc.perform(post("/v1/auth/register").contentType(MediaType.APPLICATION_JSON
        ).content(
                String.format(
                """
                {
                  "username": "%s",
                   "password": "%s",
                   "role": "%s"
                }
                """, username, password, role)
        )).andExpect(status().isOk());

        Thread.sleep(1000);

        MimeMessage[] messages = greenMail.getReceivedMessages();
        Assertions.assertThat(messages.length).isEqualTo(1);

        String otp = GreenMailUtil.getBody(messages[0]);

        mockMvc.perform(post("/v1/auth/verify").contentType(MediaType.APPLICATION_JSON
        ).content(
                String.format(
                """
                {
                  "username": "pinklife@example.com",
                   "otp": "%s"
                }
                """, otp)
        )).andExpect(status().isOk());
        Assertions.assertThat(userRepository.findByUsername(username)).isNotEmpty();

        Optional<UnverifiedUser> unverifiedUser = userVerRepo.getUserVerificationInfoByUsername(username);
        Assertions.assertThat(unverifiedUser).isEmpty();
    }

    @Test
    public void givenExistingUsername_whenRegister_badRequest() throws Exception {
        String username = "pinklife@example.com";
        String password = "pink@1";
        Roles role = Roles.ROLE_PATIENT;

        userRepository.save(new User(username, password, List.of(role)));

        mockMvc.perform(post("/v1/auth/register").contentType(MediaType.APPLICATION_JSON
        ).content(
                String.format(
                        """
                        {
                          "username": "%s",
                           "password": "%s",
                           "role": "%s"
                        }
                        """, username, password, role)
        )).andExpect(status().isBadRequest());

        Thread.sleep(1000);

        MimeMessage[] messages = greenMail.getReceivedMessages();
        Assertions.assertThat(messages.length).isEqualTo(0);
    }

    @Test
    public void givenWrongOtp_whenRegister_badRequest() throws Exception {
        String username = "pinklife@example.com";
        String password = "pink@1";
        String role = Roles.ROLE_PATIENT.toString();

        mockMvc.perform(post("/v1/auth/register").contentType(MediaType.APPLICATION_JSON
        ).content(
                String.format(
                        """
                        {
                          "username": "%s",
                           "password": "%s",
                           "role": "%s"
                        }
                        """, username, password, role)
        )).andExpect(status().isOk());

        Thread.sleep(1000);

        MimeMessage[] messages = greenMail.getReceivedMessages();
        Assertions.assertThat(messages.length).isEqualTo(1);


        mockMvc.perform(post("/v1/auth/verify").contentType(MediaType.APPLICATION_JSON
        ).content(
                String.format(
                        """
                        {
                          "username": "pinklife@example.com",
                           "otp": "%s"
                        }
                        """, "1234")
        )).andExpect(status().isBadRequest());
    }

    @Test
    public void givenTimedOutOtp_whenRegister_timedOut() throws Exception {
        String username = "pinklife@example.com";
        String password = "pink@1";
        String role = Roles.ROLE_PATIENT.toString();

        mockMvc.perform(post("/v1/auth/register").contentType(MediaType.APPLICATION_JSON
        ).content(
                String.format(
                        """
                        {
                          "username": "%s",
                           "password": "%s",
                           "role": "%s"
                        }
                        """, username, password, role)
        )).andExpect(status().isOk());

        Thread.sleep(2500);

        MimeMessage[] messages = greenMail.getReceivedMessages();
        Assertions.assertThat(messages.length).isEqualTo(1);

        String otp = GreenMailUtil.getBody(messages[0]);

        mockMvc.perform(post("/v1/auth/verify").contentType(MediaType.APPLICATION_JSON
        ).content(
                String.format(
                        """
                        {
                          "username": "pinklife@example.com",
                           "otp": "%s"
                        }
                        """, otp)
        )).andExpect(status().isRequestTimeout());
    }
}
