package com.sadi.pinklifeline.models.reqeusts;

import com.sadi.pinklifeline.utils.BasicUtils;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ReportReq {
    @NotNull
    private String doctorName;

    @NotNull
    private String hospitalName;

    @NotNull
    private LocalDate date;

    @NotNull
    @Size(max = 1000, message = "Summary can not be more than 1000 characters long")
    private String summary;

    @NotNull
    @Size(max = 512)
    private String fileLink;

    @NotNull
    private List<String> keywords;

    @AssertTrue(message = "Can't consist of duplicate keywords")
    public boolean isDuplicate() {
        Set<String> set = BasicUtils.convertToLowerCaseFromListToSet(keywords);
        return set.size() == keywords.size();
    }
}
