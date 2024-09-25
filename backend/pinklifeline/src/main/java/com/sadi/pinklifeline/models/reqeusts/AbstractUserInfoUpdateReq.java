package com.sadi.pinklifeline.models.reqeusts;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.models.entities.Medication;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
public abstract class AbstractUserInfoUpdateReq {
    @NotNull(message = "fullName field not provided")
    private String fullName;

    @NotNull(message = "weight field not provided")
    private Double weight;

    @NotNull(message = "height field not provided")
    private Double height;

    @NotNull(message = "cancerHistory field not provided")
    private YesNo cancerHistory;

    private List<String> cancerRelatives;

    @AssertTrue(message = "If your family has cancer history, y" +
            "ou must send your relation with that relative && if they don't, cancerRelatives must be empty list")
    public boolean isCancerHistory() {
        if(cancerHistory == YesNo.Y)
        {
            return !cancerRelatives.isEmpty();
        }
        else{
            return cancerRelatives.isEmpty();
        }
    }

    private List<String> periodIrregularities;

    private List<String> allergies;

    private List<String> organsWithChronicCondition;

    private List<Medication> medications;

    public AbstractUserInfoUpdateReq() {
        cancerRelatives = new ArrayList<>();
        periodIrregularities = new ArrayList<>();
        organsWithChronicCondition = new ArrayList<>();
        medications = new ArrayList<>();
        allergies = new ArrayList<>();
    }
}
