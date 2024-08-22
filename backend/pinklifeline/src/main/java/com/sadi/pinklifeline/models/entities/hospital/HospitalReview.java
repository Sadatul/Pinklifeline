package com.sadi.pinklifeline.models.entities.hospital;

import com.sadi.pinklifeline.models.entities.Review;
import com.sadi.pinklifeline.models.entities.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@Table(name = "hospital_reviews")
@SecondaryTable(
        name = "hospital_reviews_comments",
        pkJoinColumns = @PrimaryKeyJoinColumn(name = "review_id")
)
public class HospitalReview implements Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    @ToString.Exclude
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    @ToString.Exclude
    private User reviewer;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(table = "hospital_reviews_comments", name = "comment", nullable = false)
    private String comment;

    public HospitalReview(Hospital hospital, User reviewer, Integer rating) {
        this.hospital = hospital;
        this.reviewer = reviewer;
        this.rating = rating;
        this.timestamp = LocalDateTime.now();
    }

    public HospitalReview() {
        timestamp = LocalDateTime.now();
    }

    @Override
    public Long getReviewerId() {
        return reviewer.getId();
    }

    @Override
    public Long getResourceId() {
        return hospital.getId();
    }
}
