package com.sadi.pinklifeline.models.responses;

import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ReviewSummaryRes {
    private Long count;
    private Double averageRating;
    private Long[] ratingCount;
}
