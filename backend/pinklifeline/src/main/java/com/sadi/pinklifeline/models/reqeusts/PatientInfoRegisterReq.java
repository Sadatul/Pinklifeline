package com.sadi.pinklifeline.models.reqeusts;

import com.sadi.pinklifeline.enums.CancerStages;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class PatientInfoRegisterReq extends AbstractUserInfoRegisterReq {
    @NotNull
    private CancerStages cancerStage;

    @NotNull
    private LocalDate diagnosisDate;

    @NotNull
    private String location;

    public @NotNull CancerStages getCancerStage() {
        return cancerStage;
    }

    public @NotNull LocalDate getDiagnosisDate() {
        return diagnosisDate;
    }

    public @NotNull String getLocation() {
        return location;
    }

    public void setCancerStage(@NotNull CancerStages cancerStage) {
        this.cancerStage = cancerStage;
    }

    public void setDiagnosisDate(@NotNull LocalDate diagnosisDate) {
        this.diagnosisDate = diagnosisDate;
    }

    public void setLocation(@NotNull String location) {
        this.location = location;
    }

    @Override
    public String toString() {
        return "PatientInfoRegisterReq{" +
                super.toString()+
                "cancerStage=" + cancerStage +
                ", diagnosisDate=" + diagnosisDate +
                ", location='" + location + '\'' +
                '}';
    }
}
