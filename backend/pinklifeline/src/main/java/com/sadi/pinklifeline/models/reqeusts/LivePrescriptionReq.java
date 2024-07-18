package com.sadi.pinklifeline.models.reqeusts;

import com.sadi.pinklifeline.models.entities.Medication;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class LivePrescriptionReq implements Serializable {
    @NotNull(message = "Must provide a receiver Id")
    private Long receiverId;
    @NotNull(message = "Must have a call ID")
    private String callId;

    @NotNull(message = "Must have analysis but can be empty string")
    private String analysis;

    @NotNull(message = "Must have medications but can be empty list")
    private List<Medication> medications;

    @NotNull(message = "Must have tests but can be empty list")
    private List<String> tests;
}
