package com.sadi.pinklifeline.models.reqeusts;

import com.sadi.pinklifeline.enums.WorkTag;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.HashSet;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class PaidWorkReq {
    @NotNull
    @Size(min = 1, max = 255, message = "Title length must be within 1 to 255 chars")
    private String title;

    @NotNull
    @Size(min = 1, max = 1000, message = "Description length must be within 1 to 1000 chars")
    private String description;

    @NotNull
    private List<WorkTag> tags;

    @AssertTrue(message = "Can't consist of duplicate tags")
    public boolean isDuplicate() {
        return (new HashSet<>(tags)).size() == tags.size();
    }

}
