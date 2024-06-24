package com.sadi.pinklifeline.models;

import com.sadi.pinklifeline.enums.YesNo;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Data
@AllArgsConstructor
public class BasicUserInfoRegisterReq {

    @NotNull(message = "fullName field not provided")
    private String fullName;

    @NotNull(message = "weight field not provided")
    private Double weight;

    @NotNull(message = "dob field not provided")
    private LocalDate dob;

    @NotNull(message = "height field not provided")
    private Double height;

    @NotNull(message = "cancerHistory field not provided")
    private YesNo cancerHistory;


    private List<String> cancerRelatives;

    @AssertTrue(message = "If your family has cancer history, you must send your relation with that relative")
    public boolean isCancerHistory() {
        return (cancerHistory == YesNo.N || !cancerRelatives.isEmpty());
    }

    @NotNull(message = "lastPeriodDate field not provided")
    private LocalDate lastPeriodDate;

    @NotNull(message = "avgCycleLength field not provided")
    private int avgCycleLength;

    private String profilePicture;

    private List<String> periodIrregularities;

    private List<String> allergies;

    private List<String> organsWithChronicCondition;

    private List<Medication> medications;

    public BasicUserInfoRegisterReq() {
        cancerRelatives = List.of();
        periodIrregularities = List.of();
        organsWithChronicCondition = List.of();
        medications = List.of();
    }
}
