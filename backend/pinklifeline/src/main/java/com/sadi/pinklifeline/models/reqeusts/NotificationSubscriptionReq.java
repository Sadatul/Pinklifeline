package com.sadi.pinklifeline.models.reqeusts;


import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class NotificationSubscriptionReq {
    @NotNull
    private String endpoint;

    @NotNull
    private String publicKey;

    @NotNull
    private String auth;

    @NotNull
    private Integer permissions;
}
