package com.sadi.pinklifeline.controllers.doctor;

import com.sadi.pinklifeline.externals.getstream.StreamClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/v1/meeting")
public class MeetingHandlerV1 {

    private final StreamClient streamClient;

    public MeetingHandlerV1(StreamClient streamClient) {
        this.streamClient = streamClient;
    }

    @GetMapping("/user/token")
    public ResponseEntity<Map<String, String>> token() {
        Map<String, String> map = new HashMap<>();
        map.put("token", streamClient.getUserToken());
        return ResponseEntity.ok(map);
    }
}
