package com.sadi.pinklifeline.models.entities;

import com.sadi.pinklifeline.enums.SubscriptionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@ToString
@Table(name = "subscriptions")
public class Subscription {
    @Id
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_type", nullable = false)
    private SubscriptionType subscriptionType;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;
    public Subscription(Long id){
        this.userId = id;
    }

    public Subscription(Long id, SubscriptionType subscriptionType) {
        this.userId = id;
        this.subscriptionType = subscriptionType;
    }

    public Subscription(Long id, SubscriptionType subscriptionType, LocalDateTime expiryDate) {
        this.userId = id;
        this.subscriptionType = subscriptionType;
        this.expiryDate = expiryDate;
    }
}
