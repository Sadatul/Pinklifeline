package com.sadi.pinklifeline.models.dtos;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class RatingAvgAndRatingCountPair implements Serializable {
    private Double avg;
    private Long count;

    public RatingAvgAndRatingCountPair(Double avg, Long count) {
        this.avg = avg;
        this.count = count;
    }
}
