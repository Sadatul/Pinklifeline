package com.sadi.pinklifeline.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@Table(name = "balance_history")
public class BalanceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Integer value;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public BalanceHistory(User user, String description, Integer value) {
        this.user = user;
        this.description = description;
        this.value = value;
        this.timestamp = LocalDateTime.now();
    }

    public BalanceHistory() {

    }
}
