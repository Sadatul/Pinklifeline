package com.sadi.pinklifeline.models.responses;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ReviewRes {
    Long id;
    Long reviewerId;
    String reviewerName;
    String profilePicture;
    Integer rating;
    String comment;
    LocalDateTime timestamp;

    public ReviewRes(Long id, Long reviewerId, String reviewerName, String profilePicture,
                           String comment, Integer rating, LocalDateTime timestamp) {
        this.id = id;
        this.reviewerId = reviewerId;
        this.reviewerName = reviewerName;
        this.profilePicture = profilePicture;
        this.comment = comment;
        this.rating = rating;
        this.timestamp = timestamp;
    }
}
