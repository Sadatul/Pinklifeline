package com.sadi.pinklifeline.models.dtos;

import com.sadi.pinklifeline.enums.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public interface AppointmentUserDTO {
    Long getId();
    UserDTO getUser();
    String getPatientContactNumber();
    LocalDate getDate();
    LocalTime getTime();
    LocationDTO getLocation();
    Boolean getIsOnline();
    Boolean getIsPaymentComplete();
    AppointmentStatus getStatus();

    interface UserDTO{
        Long getId();
        BasicUserDTO getBasicUser();
        interface BasicUserDTO{
            String getFullName();
        }
    }

    interface LocationDTO{
        Long getId();
        String getLocation();
        Integer getFees();
    }
}
