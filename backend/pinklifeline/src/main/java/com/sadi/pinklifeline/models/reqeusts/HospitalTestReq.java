package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class HospitalTestReq {

    @NotNull
    private Long hospitalId;

    @NotNull
    private Long testId;

    @NotNull
    private Integer fee;
}
