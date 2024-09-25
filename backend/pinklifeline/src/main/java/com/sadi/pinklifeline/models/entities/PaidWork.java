package com.sadi.pinklifeline.models.entities;

import com.sadi.pinklifeline.enums.PaidWorkStatus;
import com.sadi.pinklifeline.enums.WorkTag;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@Table(name = "paid_works", indexes = {
        @Index(name = "index_paid_works_created_at", columnList = "created_at"),
        @Index(name = "index_paid_works_address", columnList = "address")
})
@SecondaryTable(
        name = "paid_work_providers",
        pkJoinColumns = @PrimaryKeyJoinColumn(name = "work_id")
)
@EntityListeners(AuditingEntityListener.class)
public class PaidWork {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(table = "paid_work_providers", name = "provider_id", nullable = false)
    private DoctorDetails healCareProvider;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "last_updated", nullable = false)
    @LastModifiedDate
    private LocalDateTime lastUpdated;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "paid_work_tags",joinColumns = @JoinColumn(name = "work_id"),
            indexes = @Index(name = "index_paid_work_tags_tag", columnList = "tag"))
    @Column(name = "tag", nullable = false)
    @Enumerated(EnumType.STRING)
    @ToString.Exclude
    private List<WorkTag> tags;

    @Version
    private Long version;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PaidWorkStatus status;

    public PaidWork(User user, String title, String description, String address, List<WorkTag> tags) {
        this.user = user;
        this.title = title;
        this.description = description;
        this.address = address;
        this.tags = tags;
        this.status = PaidWorkStatus.POSTED;
    }
}
