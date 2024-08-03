package com.sadi.pinklifeline.models.dtos;

import com.sadi.pinklifeline.enums.AppointmentStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@ToString
public class AppointmentDataForLivePrescriptionDTO {
    private Long id;
    private Long doctorId;
    private String doctorName;
    private Long patientId;
    private String patientName;
    private LocalDate patientDob;
    private Double weight;
    private Double height;
    private AppointmentStatus status;
    private Boolean isPaymentComplete;
    private Boolean isOnline;

    public AppointmentDataForLivePrescriptionDTO(Long id, Long doctorId, String doctorName, Long patientId,
                                              String patientName, LocalDate patientDob, Double weight,
                                              Double height, AppointmentStatus status, Boolean isPaymentComplete,
                                              Boolean isOnline) {
        this.id = id;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.patientId = patientId;
        this.patientName = patientName;
        this.patientDob = patientDob;
        this.weight = weight;
        this.height = height;
        this.status = status;
        this.isPaymentComplete = isPaymentComplete;
        this.isOnline = isOnline;
    }
}
