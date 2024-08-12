package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ReportShareReq {
    @NotNull
    private Long reportId;
    @NotNull
    private Long doctorId;

    @Positive
    private Long period;
}
