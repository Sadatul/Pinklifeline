package com.sadi.pinklifeline.models;

import com.sadi.pinklifeline.enums.YesNo;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
public abstract class AbstractUserInfoRegisterReq {
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
        if(cancerHistory == YesNo.Y)
        {
            return !cancerRelatives.isEmpty();
        }
        else{
            return cancerRelatives.isEmpty();
        }
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

    public AbstractUserInfoRegisterReq() {
        cancerRelatives = new ArrayList<>();
        periodIrregularities = new ArrayList<>();
        organsWithChronicCondition = new ArrayList<>();
        medications = new ArrayList<>();
        allergies = new ArrayList<>();
    }
}
