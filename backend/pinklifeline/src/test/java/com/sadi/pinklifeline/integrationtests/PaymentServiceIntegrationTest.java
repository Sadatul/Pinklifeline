package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.sadi.pinklifeline.externals.sslcommerz.SslcommerzClientService;
import com.sadi.pinklifeline.externals.sslcommerz.SslcommerzInitResponse;
import com.sadi.pinklifeline.externals.sslcommerz.SslcommerzValidationResponse;
import com.sadi.pinklifeline.repositories.PaymentSessionKeyRepository;
import lombok.extern.slf4j.Slf4j;
import static org.junit.jupiter.api.Assertions.*;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Slf4j
public class PaymentServiceIntegrationTest extends AbstractBaseIntegrationTest{
    @Autowired
    private SslcommerzClientService sslcommerzClientService;

    @Autowired
    private PaymentSessionKeyRepository repository;

    @Test
    public void testPayment() throws JsonProcessingException {
        SslcommerzInitResponse res = sslcommerzClientService.initiatePayment(1L,100.0, "Sadi",
                "sdfasdfsdf", "sadfsdfsdfsadf");

        assertEquals("SUCCESS", res.getStatus());

        Optional<String> sessionKey = repository.getUserSessionKey(res.getTranId());
        Assertions.assertThat(sessionKey).isPresent();
        SslcommerzValidationResponse validationRes = sslcommerzClientService.validatePayment(res.getTranId());
        log.info("Validation response: {}", validationRes);
    }
}
