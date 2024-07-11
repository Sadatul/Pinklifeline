package com.sadi.pinklifeline.models.entities;

import java.time.LocalDateTime;

public interface Review {
    Long getId();
    Long getReviewerId();
    Long getResourceId();
    Integer getRating();
//    LocalDateTime getTimestamp();
    String getComment();
    void setComment(String comment);
    void setRating(Integer rating);
    void setTimestamp(LocalDateTime timestamp);
}
