package com.sadi.pinklifeline.models.dtos;

import com.sadi.pinklifeline.models.entities.Medication;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class LivePrescription {
    private String analysis;

    private List<Medication> medications;

    private List<String> tests;
}
