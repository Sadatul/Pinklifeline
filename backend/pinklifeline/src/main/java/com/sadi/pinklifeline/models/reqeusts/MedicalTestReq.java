package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class MedicalTestReq {
    @NotNull
    @Size(min = 1, max = 255, message = "name length must be within 1 to 255 chars")
    private String name;

    @NotNull
    @Size(min = 1, max = 1000, message = "description length must be within 1 to 1000 chars")
    private String description;
}
