package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;


public class DocInfoRegReq extends AbstractDocInfoRegUpdateReq{
    @NotNull(message = "Registration Number is required for registration")
    private String registrationNumber;

    @Setter
    @Getter
    @Size(max = 512)
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
