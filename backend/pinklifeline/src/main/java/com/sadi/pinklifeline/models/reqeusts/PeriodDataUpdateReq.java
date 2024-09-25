package com.sadi.pinklifeline.models.reqeusts;


import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PeriodDataUpdateReq {
    private LocalDate lastPeriodDate;
    private int avgGap;
}
