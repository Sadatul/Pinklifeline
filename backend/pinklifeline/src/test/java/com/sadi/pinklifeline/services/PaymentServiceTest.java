package com.sadi.pinklifeline.services;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.externals.sslcommerz.SslcommerzClientService;
import com.sadi.pinklifeline.externals.sslcommerz.SslcommerzInitResponse;
import com.sadi.pinklifeline.repositories.PaymentSessionKeyRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.BDDMockito;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class PaymentServiceTest{

    @Mock
    private PaymentSessionKeyRepository paymentSessionKeyRepository;

    private SslcommerzClientService clientService;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        clientService = new SslcommerzClientService(paymentSessionKeyRepository);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        ReflectionTestUtils.setField(clientService, "successUri", "http://locahost:3000/success");
        ReflectionTestUtils.setField(clientService, "failUri", "http://locahost:3000/fail");
        ReflectionTestUtils.setField(clientService, "cancelUri", "http://locahost:3000/cancel");
        ReflectionTestUtils.setField(clientService, "storeId", "dsfas668fae4f6b7f1");
        ReflectionTestUtils.setField(clientService, "storePasswd", "dsfas668fae4f6b7f1@ssl");
        ReflectionTestUtils.setField(clientService, "baseUri", "https://sandbox.sslcommerz.com");
    }

    @Test
    public void testMethod() {
        String type = "appointment";
        Long id = 1L;
        BDDMockito.willDoNothing().given(paymentSessionKeyRepository).putUserSessionKey(BDDMockito.anyString(), BDDMockito.anyString(), BDDMockito.anyLong(), BDDMockito.anyString());

        SslcommerzInitResponse res = clientService.initiatePayment(id, type, 100.00, "Sadi", "sfsdfsdf", "sdfsadf");
        System.out.println(res);
        Assertions.assertThat(res.getStatus()).isEqualTo("SUCCESS");
    }

}
