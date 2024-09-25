package com.sadi.pinklifeline.models.entities;

import com.sadi.pinklifeline.enums.ComplaintResourceType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@Entity
@Table(name = "complaints", indexes = @Index(name = "index_complaints_created_at", columnList = "createdAt"))
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ComplaintResourceType type;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Complaint() {
        this.createdAt = LocalDateTime.now();
    }

    public Complaint(User user, Long resourceId, ComplaintResourceType type, String category, String description) {
        this.user = user;
        this.resourceId = resourceId;
        this.type = type;
        this.category = category;
        this.description = description;
        this.createdAt = LocalDateTime.now();
    }
}
