package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.reqeusts.InitiatePaymentReq;
import com.sadi.pinklifeline.models.responses.InitiatePaymentRes;
import com.sadi.pinklifeline.service.AbstractPaymentService;
import com.sadi.pinklifeline.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/payment")
public class PaymentHandlerV1 {
    private final AppointmentService appointmentService;

    public PaymentHandlerV1(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/{type}/{id}/initiate")
    public ResponseEntity<InitiatePaymentRes> initiatePayment(
            @PathVariable String type,
            @PathVariable Long id, @RequestBody InitiatePaymentReq req){
        AbstractPaymentService service = paymentServiceFactory(type);
        InitiatePaymentRes res = service.initiatePayment(id, req);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{type}/{id}/validate")
    public ResponseEntity<Void> validatePayment(@PathVariable Long id,
                                                @PathVariable String type,
                                                @RequestParam String transId){
        AbstractPaymentService service = paymentServiceFactory(type);
        return service.validatePayment(id, transId);
    }

    private AbstractPaymentService paymentServiceFactory(String type){
        if(type.equalsIgnoreCase("appointment")){
            return appointmentService;
        }
        throw new ResourceNotFoundException("URL not found");
    }
}
