package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.NotificationType;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.models.dtos.WebPushMessage;
import com.sadi.pinklifeline.models.reqeusts.SetReminderReq;
import com.sadi.pinklifeline.repositories.BasicUserDetailsRepository;
import com.sadi.pinklifeline.repositories.notifications.ScheduledNotificationRepository;
import com.sadi.pinklifeline.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SelfTestReminderHandlerService {

    @Value("${FRONTEND_HOST}")
    private String frontendHost;

    @Value("${reminder.react-to-reminder.endpoint}")
    private  String reactToReminderEndpoint;

    @Value("${reminder.self-test.endpoint}")
    private  String selfTestEndpoint;

    @Value("${reminder.period-start-ping.days}")
    private  int pingDays;

    @Value("${reminder.self-test-reminder.days}")
    private  int selfTestReminderDays;

    @Value("${reminder.abnormality.threshold.days}")
    private  int abnormalityThresholdDays;

    private final ScheduledNotificationRepository scheduledNotificationRepository;
    private final NotificationHandlerService notificationHandlerService;
    private final BasicUserDetailsRepository basicUserDetailsRepository;

    @PreAuthorize("hasAnyRole('BASICUSER', 'PATIENT')")
    public void pingForPeriodStart(){
        WebPushMessage message = new WebPushMessage(
                "Hi Fighter",
                "Did your period start today?",
                List.of(new WebPushMessage.Action("open_url", "Set Reminder for self test")),
                Collections.singletonMap("url", String.format("%s%s", frontendHost, reactToReminderEndpoint))
        );

        notificationHandlerService.setScheduledNotification(message, SecurityUtils.getOwnerID(),
                LocalDate.now().plusDays(pingDays), NotificationType.PERIOD_START);
    }

    @PreAuthorize("hasAnyRole('BASICUSER', 'PATIENT')")
    public List<Object> getPeriodData(Long userId){
        Object[] value = basicUserDetailsRepository.getPeriodDataWithId(userId).orElseThrow(
                () -> new BadRequestFromUserException("User is not registered")
        );

        LocalDate lastPeriodDate = (LocalDate) ((Object[]) value[0])[0];
        int avgGap = (int) ((Object[]) value[0])[1];

        return List.of(lastPeriodDate, avgGap);
    }

    @PreAuthorize("hasAnyRole('BASICUSER', 'PATIENT')")
    public void setSelfTestReminder(SetReminderReq req){
        Long userId = SecurityUtils.getOwnerID();

        List<Object> data = updatePeriodData(req.getDays(), userId);

        WebPushMessage selfTestMessage = new WebPushMessage(
                "Hi Fighter",
                "Self Test for breast cancer",
                List.of(new WebPushMessage.Action("open_url", "Open Self Test")),
                Collections.singletonMap("url", String.format("%s%s", frontendHost, selfTestEndpoint))
        );

        notificationHandlerService.setScheduledNotification(selfTestMessage, userId,
                ((LocalDate) data.getFirst()).plusDays(selfTestReminderDays), NotificationType.SELF_TEST);

        WebPushMessage periodStartMessage = new WebPushMessage(
                "Hi Fighter",
                "Did your period start today?",
                List.of(new WebPushMessage.Action("open_url", "Set Reminder for self test")),
                Collections.singletonMap("url", String.format("%s%s", frontendHost, reactToReminderEndpoint))
        );

        notificationHandlerService.setScheduledNotification(periodStartMessage, userId,
                ((LocalDate) data.getFirst()).plusDays((Integer) data.get(1)), NotificationType.PERIOD_START);
    }

    @PreAuthorize("hasAnyRole('BASICUSER', 'PATIENT')")
    public List<Object> updatePeriodData(int days, Long userId) {
        List<Object> data = getPeriodData(userId);
        LocalDate lastPeriodDate = (LocalDate) data.getFirst();
        int avgGap = (int) data.get(1);

        LocalDate newDate = LocalDate.now().minusDays(days);
        int latestGap = Period.between(lastPeriodDate, newDate).getDays();
        int newAvgGap = (2 * avgGap + latestGap) / 3;
        if(newAvgGap > 35) newAvgGap = 28;

        basicUserDetailsRepository.updatePeriodDataById(newDate, newAvgGap, userId);
        return List.of(newDate, newAvgGap);
    }

    @PreAuthorize("hasAnyRole('BASICUSER', 'PATIENT')")
    public void setNewReminder(LocalDate lastDate, Integer avgGap,
                               Long userId, Boolean deletePrevious) {

        if(deletePrevious)
            scheduledNotificationRepository.deleteByUserIdAndType(userId, List.of(NotificationType.SELF_TEST,
                    NotificationType.PERIOD_START));

        if(avgGap < abnormalityThresholdDays){
            return;
        }

        if(!lastDate.plusDays(avgGap).isAfter(LocalDate.now())) {
            pingForPeriodStart();
            return;
        }

        WebPushMessage periodStartMessage = new WebPushMessage(
                "Hi Fighter",
                "Did your period start today?",
                List.of(new WebPushMessage.Action("open_url", "Set Reminder for self test")),
                Collections.singletonMap("url", String.format("%s%s", frontendHost, reactToReminderEndpoint))
        );

        notificationHandlerService.setScheduledNotification(periodStartMessage, userId,
                lastDate.plusDays(avgGap), NotificationType.PERIOD_START);

        if(!lastDate.plusDays(selfTestReminderDays).isAfter(LocalDate.now())) {
            return;
        }

        WebPushMessage selfTestMessage = new WebPushMessage(
                "Hi Fighter",
                "Self Test for breast cancer",
                List.of(new WebPushMessage.Action("open_url", "Open Self Test")),
                Collections.singletonMap("url", String.format("%s%s", frontendHost, selfTestEndpoint))
        );

        notificationHandlerService.setScheduledNotification(selfTestMessage, userId,
                lastDate.plusDays(selfTestReminderDays), NotificationType.SELF_TEST);
    }
}
