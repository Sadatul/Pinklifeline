package com.sadi.pinklifeline.models.dtos;

import lombok.*;

import java.io.Serializable;
import java.util.Arrays;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class RatingCountPair implements Serializable {
    private Integer rating;
    private Long count;

    public RatingCountPair(Integer rating, Long count) {
        this.rating = rating;
        this.count = count;
    }

    public static Long[] ListRatingCountPairToLongArr (List<RatingCountPair> ratingCountPairList) {
        Long[] longArr = new Long[5];
        Arrays.fill(longArr, 0L);

        for (RatingCountPair ratingCountPair : ratingCountPairList) {
            longArr[ratingCountPair.getRating() - 1] = ratingCountPair.getCount();
        }
        return longArr;
    }
}
