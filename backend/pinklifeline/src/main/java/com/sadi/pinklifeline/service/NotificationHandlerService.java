package com.sadi.pinklifeline.service;

import static com.sadi.pinklifeline.controllers.NotificationHandlerV1.*;

import com.sadi.pinklifeline.enums.NotificationType;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.NotificationSubscription;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.NotificationSubscriptionReq;
import com.sadi.pinklifeline.repositories.notifications.NotificationSubscriptionRepository;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

import java.security.GeneralSecurityException;
import java.security.Security;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationHandlerService {
    @Value("${VAPID_PUBLIC_KEY}")
    private String vapidPublicKey;

    @Value("${VAPID_PRIVATE_KEY}")
    private String vapidPrivateKey;

    private final NotificationSubscriptionRepository notificationSubscriptionRepository;
    private final UserService userService;
    private PushService pushService;

    @PostConstruct
    private void init() throws GeneralSecurityException {
        Security.addProvider(new BouncyCastleProvider());
        pushService = new PushService(vapidPublicKey, vapidPrivateKey);
    }

    public NotificationSubscription getNotificationSubscription(Long id) {
        return notificationSubscriptionRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Notification subscription with id = %d not found: " + id)
        );
    }

    public void verifyOwner(NotificationSubscription notificationSubscription, Long userId) {
        if (!Objects.equals(notificationSubscription.getUser().getId(), userId)) {
            throw new AuthorizationDeniedException(
                    String.format("User with id:%d doesn't have access to the notification with id: %d"
                            , userId, notificationSubscription.getId()),
                    () -> false);
        }
    }

    public Long subscribe(NotificationSubscriptionReq req) {
        Long userId = SecurityUtils.getOwnerID();
        User user = userService.getUserIfRegisteredOnlyId(userId);

        notificationSubscriptionRepository.findByUserAndEndpoint(user, req.getEndpoint()).ifPresent(
                notificationSubscription -> {throw new BadRequestFromUserException(
                            String.format("Notification subscription for endpoint %s for user %d already exists",
                                    req.getEndpoint(), userId)
                    );
                }
        );

        NotificationSubscription notificationSubscription = new NotificationSubscription(user, req.getEndpoint(),
                req.getPublicKey(), req.getAuth(), req.getPermissions());
        return notificationSubscriptionRepository.save(notificationSubscription).getId();
    }

    public void update(NotificationUpdateReq req, Long id) {
        Long userId = SecurityUtils.getOwnerID();
        NotificationSubscription notificationSubscription = getNotificationSubscription(id);
        verifyOwner(notificationSubscription, userId);
        notificationSubscription.setPermissions(req.getPermissions());
        notificationSubscriptionRepository.save(notificationSubscription);
    }

    public NotificationSubscription getNotificationSubscriptionByEndpointAndUserId(Long ownerID, String endpoint) {
        User user = new User(ownerID);
        return notificationSubscriptionRepository.findByUserAndEndpoint(user, endpoint).orElseThrow(() -> new ResourceNotFoundException(
                String.format("Notification subscription for user with id: %d and endpoint %s doesn't exist", ownerID, endpoint)
        ));
    }

    public void sendNotification(String payload, Long userId, NotificationType type){
        List<NotificationSubscription> subscriptions = notificationSubscriptionRepository
                .findByUser(new User(userId));
        subscriptions.forEach(subscription -> {

            if(subscription.isPermissionGranted(type)){
                try {
                    Notification notification = Notification.builder().endpoint(subscription.getEndpoint())
                                    .userPublicKey(subscription.getPublicKey()).userAuth(subscription.getAuth())
                                    .payload(payload).build();

                    pushService.send(notification);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        });
    }
}
