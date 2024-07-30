package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.reqeusts.InitiatePaymentReq;
import com.sadi.pinklifeline.models.responses.InitiatePaymentRes;
import com.sadi.pinklifeline.service.AbstractPaymentService;
import com.sadi.pinklifeline.service.AppointmentService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@Slf4j
@RequestMapping("/v1/payment")
public class PaymentHandlerV1 {
    @Value("${payment.redirect.uri.frontend}")
    private String frontendRedirectUri;

    private final AppointmentService appointmentService;

    public PaymentHandlerV1(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/{type}/{id}/initiate")
    public ResponseEntity<InitiatePaymentRes> initiatePayment(
            @PathVariable String type,
            @PathVariable Long id, @RequestBody InitiatePaymentReq req){
        AbstractPaymentService service = paymentServiceFactory(type);
        InitiatePaymentRes res = service.initiatePayment(id, type, req);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{type}/{id}/validate")
    public ResponseEntity<Void> validatePayment(@PathVariable Long id,
                                                @PathVariable String type,
                                                @RequestParam String transId){
        AbstractPaymentService service = paymentServiceFactory(type);
        return service.validatePayment(id, type, transId);
    }

    @PostMapping("/{type}/{id}/ssl-redirect")
    @CrossOrigin("null")
    public ResponseEntity<Void> paymentRedirect(@PathVariable Long id,
                                                @PathVariable String type,
                                                @RequestParam String transId,
                                                HttpServletResponse response) throws IOException {
        AbstractPaymentService service = paymentServiceFactory(type);
        ResponseEntity<Void> res = service.validatePayment(id, type, transId);
        if(res.getStatusCode().equals(HttpStatus.OK))
        {
            response.sendRedirect(String.format("%s?status=SUCCESS&transactionId=%s&type=%s&id=%d",
                    frontendRedirectUri, transId, type, id));
        }
        else if(res.getStatusCode().equals(HttpStatus.ACCEPTED))
        {
            response.sendRedirect(String.format("%s?status=PENDING&transactionId=%s&type=%s&id=%d",
                    frontendRedirectUri, transId, type, id));
        }
        else{
            response.sendRedirect(String.format("%s?status=FAILED&transactionId=%s&type=%s&id=%d",
                    frontendRedirectUri, transId, type, id));
        }
        return res;
    }

    private AbstractPaymentService paymentServiceFactory(String type){
        if(type.equalsIgnoreCase("appointment")){
            return appointmentService;
        }
        throw new ResourceNotFoundException("URL not found");
    }
}
