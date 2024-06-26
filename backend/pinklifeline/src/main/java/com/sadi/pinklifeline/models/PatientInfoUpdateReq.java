package com.sadi.pinklifeline.models;

import com.sadi.pinklifeline.enums.CancerStages;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class PatientInfoUpdateReq extends AbstractUserInfoUpdateReq{
    @NotNull
    private CancerStages cancerStage;

    @NotNull
    private LocalDate diagnosisDate;


    public @NotNull CancerStages getCancerStage() {
        return cancerStage;
    }

    public @NotNull LocalDate getDiagnosisDate() {
        return diagnosisDate;
    }

    public void setCancerStage(@NotNull CancerStages cancerStage) {
        this.cancerStage = cancerStage;
    }

    public void setDiagnosisDate(@NotNull LocalDate diagnosisDate) {
        this.diagnosisDate = diagnosisDate;
    }

    @Override
    public String toString() {
        return "PatientInfoRegisterReq{" +
                super.toString()+
                "cancerStage=" + cancerStage +
                ", diagnosisDate=" + diagnosisDate + '\'' +
                '}';
    }
}
