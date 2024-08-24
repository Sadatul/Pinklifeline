package com.sadi.pinklifeline.models.dtos;

import com.sadi.pinklifeline.enums.PaidWorkStatus;
import com.sadi.pinklifeline.enums.WorkTag;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class PaidWorkDTO {
    private Long id;

    private Long userId;
    private String username;
    private String userFullName;

    private Long providerId;
    private String providerName;
    private String providerMail;
    private String providerContactNumber;

    private String title;
    private String description;
    private String address;
    private LocalDateTime createdAt;
    private PaidWorkStatus status;
    private List<WorkTag> tags;

    public PaidWorkDTO(Long id, Long userId, String username, String userFullName, Long providerId, String title, String description, String address, LocalDateTime createdAt, PaidWorkStatus status) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.userFullName = userFullName;
        this.providerId = providerId;
        this.title = title;
        this.description = description;
        this.address = address;
        this.createdAt = createdAt;
        this.status = status;
    }
}
