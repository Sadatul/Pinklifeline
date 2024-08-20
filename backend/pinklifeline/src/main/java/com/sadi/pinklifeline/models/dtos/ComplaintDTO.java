package com.sadi.pinklifeline.models.dtos;

import com.sadi.pinklifeline.enums.ComplaintResourceType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ComplaintDTO {
    private Long id;

    private String username;

    private String fullName;

    private Long resourceId;

    private ComplaintResourceType type;

    public ComplaintDTO(Long id, String username, String fullName, Long resourceId, ComplaintResourceType type) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.resourceId = resourceId;
        this.type = type;
    }
}
