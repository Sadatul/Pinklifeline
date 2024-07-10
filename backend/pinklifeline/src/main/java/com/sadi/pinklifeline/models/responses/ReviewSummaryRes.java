package com.sadi.pinklifeline.models.responses;

import com.sadi.pinklifeline.models.dtos.RatingCountPair;
import lombok.*;

import java.util.List;

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
