package com.sadi.pinklifeline.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.enums.NotificationType;
import com.sadi.pinklifeline.models.dtos.WebPushMessage;
import com.sadi.pinklifeline.models.entities.NotificationSubscription;
import com.sadi.pinklifeline.models.reqeusts.NotificationSubscriptionReq;
import com.sadi.pinklifeline.service.NotificationHandlerService;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationHandlerV1 {
    private final NotificationHandlerService notificationHandlerService;
    private final ObjectMapper jacksonObjectMapper;

    @PostMapping("/subscriptions")
    public ResponseEntity<Void> subscribe(@RequestBody NotificationSubscriptionReq req){
        log.debug("Notification Subscription request received: {}", req);
        Long id = notificationHandlerService.subscribe(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/subscriptions/{id}")
    public ResponseEntity<Void> updateNotificationSettings(@RequestBody NotificationUpdateReq req,
                                                           @PathVariable Long id){
        log.debug("Notification settings update request received: {} with id: {}", req, id);
        notificationHandlerService.update(req, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<Map<String, Object>> getNotificationSettings(
            @RequestParam String endpoint
    ){
        log.debug("Get Notification settings request received: {}", endpoint);
        NotificationSubscription notificationSubscription = notificationHandlerService.getNotificationSubscriptionByEndpointAndUserId(
                SecurityUtils.getOwnerID(), endpoint
        );

        Map<String, Object> res = Stream.of(new Object[][]{
                {"id", notificationSubscription.getId()},
                {"permissions", notificationSubscription.getPermissions()}
        }).collect(Collectors.toMap((data) -> (String) data[0], data -> data[1]));

        return ResponseEntity.ok(res);
    }

//    @GetMapping("/send")
//    public ResponseEntity<Map<String, Object>> sendNotification() throws JsonProcessingException {
//        String payload = jacksonObjectMapper.writeValueAsString(new WebPushMessage("Adil Vai", "AdilVai",
//                List.of(new WebPushMessage.Action("open_url", "open_url")), Collections.singletonMap("url", "https://www.youtube.com/")));
//        notificationHandlerService.sendNotification(payload, 2L, NotificationType.PERIOD_START);
//        return ResponseEntity.ok().build();
//    }

    @Getter
    @Setter
    @ToString
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationUpdateReq {
        @NotNull
        private Integer permissions;
    }
}
