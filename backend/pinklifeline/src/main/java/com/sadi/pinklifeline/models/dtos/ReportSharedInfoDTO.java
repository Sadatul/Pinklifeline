package com.sadi.pinklifeline.models.dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ReportSharedInfoDTO {
    private Long id;
    private String username;
    private String fullName;
    private LocalDateTime expirationTime;

    public ReportSharedInfoDTO(Long id, String username, String fullName, LocalDateTime expirationTime) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.expirationTime = expirationTime;
    }
}
