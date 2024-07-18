package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class RegisterAppointmentReq {
    @NotNull
    private Long patientId;
    @NotNull
    private Long doctorId;
    @NotNull
    private String patientContactNumber;
    @NotNull
    private Long locationId;
    @NotNull
    private LocalDate date;

    private LocalTime time;

    @NotNull
    private Boolean isOnline;
}
