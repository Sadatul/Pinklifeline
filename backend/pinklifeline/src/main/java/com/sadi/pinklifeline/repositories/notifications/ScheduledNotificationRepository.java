package com.sadi.pinklifeline.repositories.notifications;

import com.sadi.pinklifeline.models.entities.ScheduledNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ScheduledNotificationRepository extends JpaRepository<ScheduledNotification, Long> {
    List<ScheduledNotification> findByTargetDate(LocalDate targetDate);
}
