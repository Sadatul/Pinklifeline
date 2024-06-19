package com.sadi.pinklifeline.models;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class UserVerificationRequest {
    @NotNull
    private String username;
    @NotNull
    private String otp;

}