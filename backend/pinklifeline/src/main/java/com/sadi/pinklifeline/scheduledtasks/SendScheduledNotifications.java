package com.sadi.pinklifeline.scheduledtasks;

import com.sadi.pinklifeline.models.entities.ScheduledNotification;
import com.sadi.pinklifeline.repositories.notifications.ScheduledNotificationRepository;
import com.sadi.pinklifeline.service.NotificationHandlerService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SendScheduledNotifications {
    private final ScheduledNotificationRepository scheduledNotificationRepository;
    private final NotificationHandlerService notificationHandlerService;

    @Scheduled(cron = "${send.scheduled.notifications.cron}")
    public void sendNotifications() {
        List<ScheduledNotification> notifications = scheduledNotificationRepository.findByTargetDate(LocalDate.now());
        notifications.forEach(notification -> {
            notificationHandlerService.sendNotification(notification.getPayload(),
                    notification.getUser().getId(), notification.getType());
            scheduledNotificationRepository.delete(notification);
        });
    }
}
