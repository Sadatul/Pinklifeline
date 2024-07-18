package com.sadi.pinklifeline.models.responses;

import com.sadi.pinklifeline.enums.CancerStages;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class PatientResForeign {
    private CancerStages cancerStage;

    private LocalDate diagnosisDate;

    public PatientResForeign(CancerStages cancerStage, LocalDate diagnosisDate) {
        this.cancerStage = cancerStage;
        this.diagnosisDate = diagnosisDate;
    }
}
