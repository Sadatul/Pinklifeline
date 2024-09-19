package com.sadi.pinklifeline.models.reqeusts;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class NotificationSubscriptionReq {
    @NotNull
    @Size(max = 1000)
    private String endpoint;

    @NotNull
    @Size(max = 1000)
    private String publicKey;

    @NotNull
    @Size(max = 1000)
    private String auth;

    @NotNull
    private Integer permissions;
}
