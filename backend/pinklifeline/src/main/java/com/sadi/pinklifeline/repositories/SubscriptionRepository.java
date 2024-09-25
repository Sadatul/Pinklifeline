package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
}
