package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public abstract class AbstractReviewReq {
    @NotNull(message = "A review must have a rating")
    @Max(value = 5, message = "Review can't have higher than 5 stars")
    @Positive(message = "A review must have at least one star")
    private Integer rating;

    @Size(max = 255, message = "A review comment can't have more than 255 characters")
    private String comment;
}
