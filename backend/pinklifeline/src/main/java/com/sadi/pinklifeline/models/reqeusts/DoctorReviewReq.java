package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.*;


public class DoctorReviewReq extends AbstractReviewReq{
    @NotNull(message = "Must provide id of the resource")
    private Long id;

    public @NotNull(message = "Must provide id of the resource") Long getId() {
        return id;
    }

    public void setId(@NotNull(message = "Must provide id of the resource") Long id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return "DoctorReviewReq{" +
                "id=" + id +
                "rating=" + getRating() +
                "comment=" + getComment() +
                '}';
    }
}
