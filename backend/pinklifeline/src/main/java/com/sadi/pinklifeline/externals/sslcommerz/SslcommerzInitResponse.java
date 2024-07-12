package com.sadi.pinklifeline.externals.sslcommerz;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class SslcommerzInitResponse {
    private String status;
    private String failedreason;
    private String sessionkey;
    @JsonProperty("GatewayPageURL")
    private String gatewayPageURL;
    private String tranId;
}
