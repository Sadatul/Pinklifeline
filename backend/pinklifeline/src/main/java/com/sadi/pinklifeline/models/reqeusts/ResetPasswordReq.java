package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ResetPasswordReq {
    @NotNull
    @Email
    private String email;

    @NotNull
    @Size(min=6, message = "Password must be at least 6 characters long.")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[!@#$%^&*(),.?\":{}|<>]).{2,}$", message = "A password must include at least one number and one special character.")
    private String password;

    @NotNull
    private String token;
}
