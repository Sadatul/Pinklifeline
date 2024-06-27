package com.sadi.pinklifeline.models.dtos;

import com.sadi.pinklifeline.models.entities.User;
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
