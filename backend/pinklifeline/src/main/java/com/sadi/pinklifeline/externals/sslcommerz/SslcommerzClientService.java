package com.sadi.pinklifeline.externals.sslcommerz;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.exceptions.InternalServerErrorException;
import com.sadi.pinklifeline.repositories.PaymentSessionKeyRepository;
import com.sadi.pinklifeline.utils.CodeGenerator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Optional;

@Service
@Slf4j
public class SslcommerzClientService {

    private final RestClient restClient;
    private final PaymentSessionKeyRepository sessionKeyRepository;

    @Value("${BACKEND_HOST}")
    private String backendHost;

    @Value("${payment.sslcommerz.base.uri:https://sandbox.sslcommerz.com}")
    private String baseUri;
    @Value("${SSLCOMMERZ_STORE_ID}")
    private String storeId;
    @Value("${SSLCOMMERZ_STORE_PASSWD}")
    private String storePasswd;

    public SslcommerzClientService(PaymentSessionKeyRepository sessionKeyRepository) {
        this.sessionKeyRepository = sessionKeyRepository;
        this.restClient = RestClient.create();
    }

    public SslcommerzInitResponse initiatePayment(Long resourceId, String type, Double totalAmount,
                                                  String cusName, String cusEmail, String cusPhone) {
        String tranId = CodeGenerator.transactionIdGenerator();
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("store_id", storeId);
        formData.add("store_passwd", storePasswd);
        formData.add("total_amount", totalAmount.toString());
        formData.add("currency", "BDT");
        formData.add("tran_id", tranId);
        formData.add("success_url", String.format("%s/v1/payment/%s/%d/ssl-redirect?transId=%s", backendHost, type, resourceId, tranId));
        formData.add("fail_url", String.format("%s/v1/payment/%s/%d/ssl-redirect?transId=%s", backendHost, type, resourceId, tranId));
        formData.add("cancel_url", String.format("%s/v1/payment/%s/%d/ssl-redirect?transId=%s", backendHost, type, resourceId, tranId));
        formData.add("cus_name", cusName);
        formData.add("cus_email", cusEmail);
        formData.add("cus_add1", "Online");
        formData.add("cus_city", "Online");
        formData.add("cus_state", "Online");
        formData.add("cus_postcode", "Online");
        formData.add("cus_country", "Online");
        formData.add("cus_phone", cusPhone);
        formData.add("shipping_method", "NO");
        formData.add("product_name", resourceId.toString());
        formData.add("product_category", type);
        formData.add("product_profile", "Service");


        String url = baseUri + "/gwprocess/v4/api.php";
        System.out.println("Work");
        SslcommerzInitResponse res = restClient.post().uri(url)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formData)
                .retrieve().body(SslcommerzInitResponse.class);

        if(res != null){
            res.setTranId(tranId);
            sessionKeyRepository.putUserSessionKey(tranId, type, resourceId, res.getSessionkey());
        }

        log.debug("Converted Object: {}", res);

        return res;
    }

    public SslcommerzValidationResponse validatePayment(String tranId, String type, Long resourceID)
            throws JsonProcessingException {
        Optional<String> sessionKey = sessionKeyRepository.getUserSessionKey(tranId, type, resourceID);
        if(sessionKey.isEmpty()){
            throw new BadRequestFromUserException("The transId provided doesn't exist or has timed out");
        }

        SslcommerzValidationResponse res = restClient.get().uri(baseUri +
                String.format("/validator/api/merchantTransIDvalidationAPI.php?sessionkey=%s&store_id=%s&store_passwd=%s&format=json"
                        , sessionKey.get(), storeId, storePasswd))
                .retrieve().body(SslcommerzValidationResponse.class);
        log.debug("Validation Response: {}", res);
        if(res == null){
            throw new InternalServerErrorException("Server failed to validate request");
        }
        if(!res.getStatus().equals("PENDING")){
                sessionKeyRepository.deleteUserSessionKeyByTransId(tranId, type, resourceID);
        }
        return res;
    }
}
