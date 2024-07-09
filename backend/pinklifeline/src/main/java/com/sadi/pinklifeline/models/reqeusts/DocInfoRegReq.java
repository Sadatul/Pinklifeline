package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.NotNull;
import lombok.*;


public class DocInfoRegReq extends AbstractDocInfoRegUpdateReq{
    @NotNull(message = "Registration Number is required for registration")
    private String registrationNumber;

    @Setter
    @Getter
    private String profilePicture;

    public @NotNull(message = "Registration Number is required for registration") String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(@NotNull(message = "Registration Number is required for registration") String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    @Override
    public String toString() {
        return "DocInfoRegReq{" +
                super.toString() +
                "profile_picture='" + profilePicture + '\'' +
                "registrationNumber='" + registrationNumber + '\'' +
                '}';
    }
}
