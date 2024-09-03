package com.sadi.pinklifeline.models.entities;

import com.sadi.pinklifeline.enums.NotificationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@Table(name = "scheduled_notifications")
public class ScheduledNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String payload;

    @Column(nullable = false)
    private LocalDate targetDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationType type;
}
