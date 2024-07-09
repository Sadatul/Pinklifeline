package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class DoctorLocationReq {
    @NotNull(message = "Must provide location of the consultation center")
    private String location;

    @NotNull(message = "Must provide location of start time of consultation")
    private LocalTime start;

    @NotNull(message = "Must provide location of end time of consultation")
    private LocalTime end;

    @NotNull(message = "Must provide working days of the week")
    @Pattern(regexp = "^[01]{7}$", message = "'workdays' can only consists of 0 and 1. workdays must have a length of 7")
    private String workdays;

    @NotNull(message = "Must provide fees")
    private Integer fees;

    @AssertTrue(message = "Ending time must be after the starting time")
    public boolean isEndTimeAfterStartTime() {
        return end.isAfter(start);
    }
}
