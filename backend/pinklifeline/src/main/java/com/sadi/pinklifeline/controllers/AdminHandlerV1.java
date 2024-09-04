package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.scheduledtasks.SendScheduledNotifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/ROLE_ADMIN")
@RequiredArgsConstructor
@Slf4j
public class AdminHandlerV1 {
    private final SendScheduledNotifications sendScheduledNotifications;

    @GetMapping("/send-notifications")
    public ResponseEntity<Void> sendNotifications() {
        sendScheduledNotifications.sendNotifications();
        return ResponseEntity.ok().build();
    }
}
