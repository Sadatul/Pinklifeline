package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.icegreen.greenmail.store.FolderException;
import com.icegreen.greenmail.util.GreenMailUtil;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.dtos.UnverifiedUser;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.repositories.UserRepository;
import com.sadi.pinklifeline.repositories.UserVerificationRepository;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.Cookie;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Rollback
@Transactional
public class AuthControllerV1Tests extends AbstractBaseIntegrationTest{
    @Value("${auth.jwt.cookie.name}")
    private String cookieName;

    @Value("${auth.jwt.timeout}")
    private int cookieJwtTimeout;

    @Value("${auth.jwt.refresh-token.cookie-name}")
    private String refreshTokenCookieName;

    @Value("${auth.jwt.refresh-token.timeout}")
    private int refreshTokenTimeout;

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
        String cookieString = resultActions.andReturn().getResponse().getHeader("Set-Cookie");

        logger.info("The cookie received: {}", cookieString);

        String response = resultActions.andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.userId").exists())
                .andExpect(jsonPath("$.roles").exists())
                .andExpect(jsonPath("$.username").exists())
                .andReturn().getResponse().getContentAsString();

        TypeReference<Map<String, Object>> typeRef = new TypeReference<>() {};
        Map<String, Object> token = objectMapper.readValue(response, typeRef);

        mockMvc.perform(get("/v1/hello").contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", token.get("token"))))
                .andExpect(status().isOk());

        Cookie cookie = new Cookie(cookieName,token.get("token").toString());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(cookieJwtTimeout); // 7 days
        mockMvc.perform(get("/v1/hello")
                        .cookie(cookie))
                .andExpect(status().isOk());

        String refreshToken = token.get("refreshToken").toString();
        Cookie refreshCookie = getRefreshCookie(refreshToken);

        response = mockMvc.perform(get("/v1/auth/refresh").cookie(refreshCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn().getResponse().getContentAsString();

        logger.info("Response from refresh_token: {}", response);
    }

    @Test
    public void resetPasswordTest() throws Exception {
        User newUser = new User("pinklife@example.com", passwordEncoder.encode("12345"),
                List.of(Roles.ROLE_PATIENT));

        userRepository.save(newUser);

        // First generating a refresh Token.
        String response = mockMvc.perform(post("/v1/auth").contentType(MediaType.APPLICATION_JSON)
                .content("""
                  {
                    "username": "pinklife@example.com",
                    "password": "12345"
                  }
                 """)).andReturn().getResponse().getContentAsString();

        TypeReference<Map<String, Object>> typeRef = new TypeReference<>() {};
        Map<String, Object> body = objectMapper.readValue(response, typeRef);

        String refreshToken = body.get("refreshToken").toString();
        Cookie refreshCookie = getRefreshCookie(refreshToken);

        mockMvc.perform(get("/v1/auth/reset-password").param("email", newUser.getUsername()))
                .andExpect(status().isOk());
        Thread.sleep(250);

        MimeMessage[] messages = greenMail.getReceivedMessages();
        Assertions.assertThat(messages.length).isEqualTo(1);

        String mailBody = GreenMailUtil.getBody(messages[0]);
        String token = mailBody.split(",")[2];
        logger.info("Token {}", token);

        String newPassword = "54321";
        mockMvc.perform(put("/v1/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format("""
                  {
                    "email": "%s",
                    "password": "%s",
                    "token": "%s"
                  }
                 """, newUser.getUsername(), newPassword, token)))
                .andExpect(status().isNoContent());

        // Checking if the previous refresh token has been invalidated or not.
        mockMvc.perform(get("/v1/auth/refresh").cookie(refreshCookie))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/v1/auth").contentType(MediaType.APPLICATION_JSON)
                .content(String.format("""
                  {
                    "username": "%s",
                    "password": "%s"
                  }
                 """, newUser.getUsername(), newPassword))).andExpect(status().isOk());
    }

    private Cookie getRefreshCookie(String refreshToken) {
        Cookie refreshCookie = new Cookie(refreshTokenCookieName, refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(refreshTokenTimeout);
        return refreshCookie;
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
