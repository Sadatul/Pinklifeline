package com.sadi.pinklifeline.services;

import com.sadi.pinklifeline.integrationtests.AbstractBaseIntegrationTest;
import com.sadi.pinklifeline.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class EmailServiceTest extends AbstractBaseIntegrationTest {

    @Autowired
    private EmailService emailService;

    @Test
    public void sendSimpleEmailTest() throws InterruptedException {
        emailService.sendSimpleEmail("pinklifeline@spring.io", "pinklifeline", "pinklifeline");
        Thread.sleep(2000); // This is necessary because sendSimpleEmail event is async
        MimeMessage[] messages = greenMail.getReceivedMessages();

        Assertions.assertThat(messages.length).isEqualTo(1);
    }

}
