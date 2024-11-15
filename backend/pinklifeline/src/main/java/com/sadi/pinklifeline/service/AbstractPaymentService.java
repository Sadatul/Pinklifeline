package com.sadi.pinklifeline.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.sadi.pinklifeline.exceptions.InternalServerErrorException;
import com.sadi.pinklifeline.externals.sslcommerz.SslcommerzClientService;
import com.sadi.pinklifeline.externals.sslcommerz.SslcommerzInitResponse;
import com.sadi.pinklifeline.externals.sslcommerz.SslcommerzValidationResponse;
import com.sadi.pinklifeline.models.reqeusts.InitiatePaymentReq;
import com.sadi.pinklifeline.models.responses.InitiatePaymentRes;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;

@Slf4j
public abstract class AbstractPaymentService {
    private final SslcommerzClientService sslcommerzClientService;
    public AbstractPaymentService(SslcommerzClientService sslcommerzClientService) {
        this.sslcommerzClientService = sslcommerzClientService;
    }

    public abstract void updatePaymentStatus(Long id);
    public abstract void setup(Long id, InitiatePaymentReq req);
    public abstract Integer getTotalAmount(Long id);
    public abstract Integer getTotalAmount(Long id, InitiatePaymentReq req);
    public abstract void validateResourceForPayment(Long id);
    public abstract void addBalanceToUsers(Long resourceId);
    public InitiatePaymentRes initiatePayment(Long id, String type, InitiatePaymentReq req) {
        validateResourceForPayment(id);
        SslcommerzInitResponse res = sslcommerzClientService.initiatePayment(id, type, getTotalAmountWithReq(id, req, type).doubleValue(),
                req.getCustomerName(),
                req.getCustomerEmail(), req.getCustomerPhone());
        if(!(res.getStatus().equals("SUCCESS"))){
            log.info("Failed to initiate payment: {}", res.getFailedreason());
            throw new InternalServerErrorException("Some issues may have occurred in the database. Please try again later");
        }
        setup(id, req);
        return new InitiatePaymentRes(res.getTranId(), res.getGatewayPageURL());
    }

    public ResponseEntity<Void> validatePayment(Long id, String type, String transactionId) {
        SslcommerzValidationResponse res;
        try {
            res = sslcommerzClientService.validatePayment(transactionId, type, id);

        } catch (JsonProcessingException e) {
            throw new InternalServerErrorException("Some issues may have occurred in the database. Please try again later");
        }
        if(res.getStatus().equals("FAILED")){
            return ResponseEntity.badRequest().build();
        }
        if(res.getStatus().equals("PENDING")){
            return ResponseEntity.accepted().build();
        }
        updatePaymentStatus(id);
        addBalanceToUsers(id);
        return ResponseEntity.ok().build();
    }

    public Integer getTotalAmountWithReq(Long id, InitiatePaymentReq req, String type) {
        if(type.equalsIgnoreCase("subscription")){
            return getTotalAmount(id, req);
        }
        else{
            return getTotalAmount(id);
        }
    }
}
