package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.NotificationType;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.models.dtos.WebPushMessage;
import com.sadi.pinklifeline.models.reqeusts.SetReminderReq;
import com.sadi.pinklifeline.repositories.BasicUserDetailsRepository;
import com.sadi.pinklifeline.repositories.notifications.ScheduledNotificationRepository;
import com.sadi.pinklifeline.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Period;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Slf4j
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

    @Value("${send.scheduled.notifications.cron}")
    private  String scheduledNotificationCron;

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
        setNewReminder((LocalDate)data.getFirst(), (Integer) data.get(1),
                userId, true);
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

        CronExpression expression = CronExpression.parse(scheduledNotificationCron);
        LocalTime nextRunTime = Objects.requireNonNull(expression.next(LocalDateTime.now())).toLocalTime();

        LocalDate targetDateForSPReminder = lastDate.plusDays(avgGap);
        if(isNotNotifiable(targetDateForSPReminder, nextRunTime)) {
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
                targetDateForSPReminder, NotificationType.PERIOD_START);

        LocalDate targetDateForSTReminder = lastDate.plusDays(selfTestReminderDays);
        if(isNotNotifiable(targetDateForSTReminder, nextRunTime)) {
            return;
        }

        WebPushMessage selfTestMessage = new WebPushMessage(
                "Hi Fighter",
                "Self Test for breast cancer",
                List.of(new WebPushMessage.Action("open_url", "Open Self Test")),
                Collections.singletonMap("url", String.format("%s%s", frontendHost, selfTestEndpoint))
        );

        notificationHandlerService.setScheduledNotification(selfTestMessage, userId,
                targetDateForSTReminder, NotificationType.SELF_TEST);
    }

    private boolean isNotNotifiable(LocalDate targetDateForSTReminder, LocalTime nextRunTime) {
        return !(targetDateForSTReminder.isAfter(LocalDate.now()) || (
                targetDateForSTReminder.isEqual(LocalDate.now()) &&
                        LocalTime.now().isBefore(nextRunTime)));
    }
}
