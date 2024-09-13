package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1")
@RequiredArgsConstructor
public class SubscriptionHandlerV1 {
    private final SubscriptionService subscriptionService;


    @PutMapping("/subscriptions/free-trial")
    public ResponseEntity<Void> getFreeTrail() {
        subscriptionService.validateUserForFreeTrial();
        subscriptionService.setUpFreeTrial();

        return ResponseEntity.noContent().build();
    }
}
