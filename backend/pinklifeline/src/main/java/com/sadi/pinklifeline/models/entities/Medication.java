package com.sadi.pinklifeline.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Embeddable
@EqualsAndHashCode
public class Medication {
    @Column(nullable = false)
    private String name;

    @Column(name = "dose_description", nullable = false)
    private String doseDescription;
}
