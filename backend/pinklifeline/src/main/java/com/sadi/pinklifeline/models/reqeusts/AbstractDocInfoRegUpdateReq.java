package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
public abstract class AbstractDocInfoRegUpdateReq {
    @NotNull(message = "Full Name is required for registration")
    private String fullName;

    @Size(min = 1, message = "At least one qualification is required")
    private List<String> qualifications;

    @NotNull(message = "Workplace info is required for registration")
    private String workplace;

    @NotNull(message = "Department is required for registration")
    private String department;

    @NotNull(message = "Designation is required for registration")
    private String designation;

    @NotNull(message = "Contact Number is required for registration")
    private String contactNumber;

    public AbstractDocInfoRegUpdateReq() {
        qualifications = new ArrayList<>();
    }
}
