package com.sadi.pinklifeline.models;

import lombok.*;

import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class UnverifiedUser implements Serializable {
    private User user;
    private String otp;
}
