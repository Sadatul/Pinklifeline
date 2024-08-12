package com.sadi.pinklifeline.models.dtos;

import com.sadi.pinklifeline.enums.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public interface AppointmentDoctorDTO {
    Long getId();
    DoctorDTO getDoctor();
    String getPatientContactNumber();
    LocalDate getDate();
    LocalTime getTime();
    LocationDTO getLocation();
    Boolean getIsOnline();
    Boolean getIsPaymentComplete();
    AppointmentStatus getStatus();

    interface DoctorDTO{
        Long getUserId();
        String getFullName();
    }

    interface LocationDTO{
        Long getId();
        String getLocation();
        Integer getFees();
    }
}
