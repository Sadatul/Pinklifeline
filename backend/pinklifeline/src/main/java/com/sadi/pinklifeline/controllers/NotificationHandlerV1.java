package com.sadi.pinklifeline.controllers;

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
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationHandlerV1 {
    private final NotificationHandlerService notificationHandlerService;

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
