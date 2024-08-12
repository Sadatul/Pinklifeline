package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;

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
    private String fileLink;

    @NotNull
    private List<String> keywords;
}
