package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class InitiatePaymentReq {
    @NotNull(message = "'customerName' must be provided")
    private String customerName;
    @NotNull(message = "'customerEmail' must be provided")
    @Email(message = "'customerEmail' must be a valid email")
    private String customerEmail;
    @NotNull(message = "'customerPhone' must be provided")
    private String customerPhone;
}
