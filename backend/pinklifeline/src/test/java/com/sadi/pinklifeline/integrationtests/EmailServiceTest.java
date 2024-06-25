package com.sadi.pinklifeline.integrationtests;

import com.icegreen.greenmail.util.GreenMailUtil;
import com.sadi.pinklifeline.service.EmailService;
import com.sadi.pinklifeline.service.UserRegistrationAndVerificationService;
import jakarta.mail.internet.MimeMessage;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class EmailServiceTest extends AbstractBaseIntegrationTest {
    @Autowired
    private UserRegistrationAndVerificationService userRegVerService;

    @Value("${verification.email.message}")
    private String verificationEmailMessage;

    @Value("${verification.email.timeout}")
    private int optExpiration;

    @Test
    public void sendSimpleEmailTest() throws InterruptedException {
        int minutes = optExpiration / 60;
        String otp = "1234";
        String message = String.format(verificationEmailMessage, otp, minutes);
        userRegVerService.sendVerificationEmail("pinklife@example.com", otp);
        Thread.sleep(2000); // This is necessary because sendSimpleEmail event is async
        MimeMessage[] messages = greenMail.getReceivedMessages();

        Assertions.assertThat(messages.length).isEqualTo(1);
        Assertions.assertThat(GreenMailUtil.getBody(messages[0])).isEqualTo(message);
    }

}
