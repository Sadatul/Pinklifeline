package com.sadi.pinklifeline.models.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MedicationReq {
    @NotNull
    private String name;

    @NotNull
    private String doseDescription;
}
