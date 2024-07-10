package com.sadi.pinklifeline.models.entities;

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
@Table(name = "doctor_reviews")
@SecondaryTable(
        name = "doctor_reviews_comments",
        pkJoinColumns = @PrimaryKeyJoinColumn(name = "review_id")
)
public class DoctorReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private DoctorDetails doctorDetails;

    @ManyToOne
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(table = "doctor_reviews_comments", name = "comment", nullable = false)
    private String comment;

    public DoctorReview(DoctorDetails doctorDetails, User reviewer, Integer rating, LocalDateTime timestamp) {
        this.doctorDetails = doctorDetails;
        this.reviewer = reviewer;
        this.rating = rating;
        this.timestamp = timestamp;
    }
}
