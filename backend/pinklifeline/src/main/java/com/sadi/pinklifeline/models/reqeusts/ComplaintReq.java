package com.sadi.pinklifeline.models.reqeusts;

import com.sadi.pinklifeline.enums.ComplaintResourceType;
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
public class ComplaintReq {
    @NotNull
    private Long resourceId;

    @NotNull
    private ComplaintResourceType type;

    @NotNull
    @Size(min = 1, max = 100, message = "Category length must be within 1 to 100 chars")
    private String category;

    @NotNull
    @Size(min = 1, max = 300, message = "Description length must be within 1 to 300 chars")
    private String description;
}
