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
public class SslcommerzValidationResponse {
    private String status;
    @JsonProperty("val_id")
    private String valId;
    @JsonProperty("store_amount")
    private Double storeAmount;
}
