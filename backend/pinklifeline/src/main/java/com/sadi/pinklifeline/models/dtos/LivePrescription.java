package com.sadi.pinklifeline.models.dtos;

import com.sadi.pinklifeline.models.entities.Medication;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class LivePrescription {
    private Long id;

    private Long patientId;

    private String patientName;

    private Long doctorId;

    private String doctorName;

    private Double weight;

    private Double height;

    private Long age;

    private String analysis;

    private List<Medication> medications;

    private List<String> tests;

    private LocalDate date;

    public LivePrescription(Long id, Long patientId, String patientName, Long doctorId, String doctorName, Double weight, Double height, Long age, String analysis, List<Medication> medications, List<String> tests) {
        this.id = id;
        this.patientId = patientId;
        this.patientName = patientName;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.weight = weight;
        this.height = height;
        this.age = age;
        this.analysis = analysis;
        this.medications = medications;
        this.tests = tests;
        this.date = LocalDate.now();
    }
}
