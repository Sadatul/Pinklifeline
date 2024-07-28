package com.sadi.pinklifeline.models.dtos;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class SharedReportDTO {
    private Long id;
    private String username;
    private String fullName;
    private LocalDateTime expirationTime;

    private Long reportId;
    private String doctorName;
    private String hospitalName;
    private LocalDate date;
    private String summary;
    private String fileLink;

    public SharedReportDTO(Long id, String username, String fullName, LocalDateTime expirationTime, Long reportId,
                           String doctorName, LocalDate date, String hospitalName,
                           String summary, String fileLink) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.expirationTime = expirationTime;
        this.reportId = reportId;
        this.doctorName = doctorName;
        this.date = date;
        this.hospitalName = hospitalName;
        this.summary = summary;
        this.fileLink = fileLink;
    }
}
