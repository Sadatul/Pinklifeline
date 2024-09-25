package com.sadi.pinklifeline.models.entities;

import com.sadi.pinklifeline.enums.NotificationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@Table(name = "notification_subscriptions")
public class NotificationSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String endpoint;

    @Column(nullable = false)
    private String publicKey;

    @Column(nullable = false)
    private String auth;

    @Column(nullable = false)
    private Integer permissions;

    public NotificationSubscription(User user, String endpoint, String publicKey, String auth, Integer permissions) {
        this.user = user;
        this.endpoint = endpoint;
        this.publicKey = publicKey;
        this.auth = auth;
        this.permissions = permissions;
    }

    public Boolean isPermissionGranted(NotificationType type) {
        return (permissions & (1 << type.getVal())) != 0;
    }
}
