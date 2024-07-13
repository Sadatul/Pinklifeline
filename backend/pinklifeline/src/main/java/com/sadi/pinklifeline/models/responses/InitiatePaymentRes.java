package com.sadi.pinklifeline.models.responses;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class InitiatePaymentRes {
    private String transactionId;
    private String gatewayUrl;

    public InitiatePaymentRes(String transactionId, String gatewayUrl) {
        this.transactionId = transactionId;
        this.gatewayUrl = gatewayUrl;
    }
}
