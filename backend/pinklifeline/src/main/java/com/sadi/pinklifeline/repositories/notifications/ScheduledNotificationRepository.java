package com.sadi.pinklifeline.repositories.notifications;

import com.sadi.pinklifeline.enums.NotificationType;
import com.sadi.pinklifeline.models.entities.ScheduledNotification;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ScheduledNotificationRepository extends JpaRepository<ScheduledNotification, Long> {
    List<ScheduledNotification> findByTargetDate(LocalDate targetDate);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("delete from ScheduledNotification sn where sn.user.id = :userId and sn.type = :type")
    void deleteByUserIdAndType(Long userId, NotificationType type);
}
