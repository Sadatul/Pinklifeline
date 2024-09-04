package com.sadi.pinklifeline.repositories.notifications;

import com.sadi.pinklifeline.models.entities.NotificationSubscription;
import com.sadi.pinklifeline.models.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationSubscriptionRepository extends JpaRepository<NotificationSubscription, Long> {
    Optional<NotificationSubscription> findByUserAndEndpoint(User user, String endpoint);
    List<NotificationSubscription> findByUser(User user);
}
