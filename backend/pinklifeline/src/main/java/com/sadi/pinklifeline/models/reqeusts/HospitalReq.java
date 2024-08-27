package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.Email;
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
public class HospitalReq {
    @NotNull
    @Size(min = 1, max = 255, message = "name length must be within 1 to 255 chars")
    private String name;

    @NotNull
    @Size(min = 1, max = 1000, message = "description length must be within 1 to 1000 chars")
    private String description;

    @NotNull
    @Size(min = 1, max = 255, message = "location length must be within 1 to 255 chars")
    private String location;

    @NotNull
    @Size(min = 1, max = 30, message = "contactNumber length must be within 1 to 30 chars")
    private String contactNumber;

    @NotNull
    @Size(min = 1, max = 255, message = "email length must be within 1 to 255 chars")
    @Email
    private String email;
}
