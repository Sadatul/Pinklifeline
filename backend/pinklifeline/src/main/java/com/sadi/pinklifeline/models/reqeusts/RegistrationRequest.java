package com.sadi.pinklifeline.models.reqeusts;

import com.sadi.pinklifeline.enums.Roles;
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
public class RegistrationRequest {

    @Email
    private String username;

    @Size(min=6, message = "Password must be at least 6 characters long.")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[!@#$%^&*(),.?\":{}|<>]).{2,}$", message = "A password must include at least one number and one special character.")
    private  String password;

    @NotNull(message = "User must have a role")
    private Roles role;
}