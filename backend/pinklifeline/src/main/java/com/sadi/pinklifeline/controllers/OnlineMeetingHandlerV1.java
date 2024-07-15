package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.service.OnlineMeetingService;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/v1/online-meeting")
public class OnlineMeetingHandlerV1 {
    private final OnlineMeetingService onlineMeetingService;

    public OnlineMeetingHandlerV1(OnlineMeetingService onlineMeetingService) {
        this.onlineMeetingService = onlineMeetingService;
    }

    @PostMapping("/start")
    public ResponseEntity<Map<String, String>> startMeeting(@RequestBody OnlineMeetingStartReq req) throws URISyntaxException {
        String callId = onlineMeetingService.startMeeting(req.getAppointmentId());
        Map<String, String> response = new HashMap<>();
        response.put("callId", callId);
        URI uri = new URI( "/v1/online-meeting/join");
        return ResponseEntity.created(uri).body(response);
    }

    @GetMapping("/join")
    public ResponseEntity<Map<String, Object>> joinMeeting() {
        Map<String, Object> response = onlineMeetingService.joinMeeting();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/close")
    public ResponseEntity<Void> closeMeeting() {
        onlineMeetingService.closeMeeting();
        return ResponseEntity.noContent().build();
    }

    @Getter
    @Setter
    @ToString
    @NoArgsConstructor
    public static class OnlineMeetingStartReq {
        @NotNull
        private Long appointmentId;
    }
}
