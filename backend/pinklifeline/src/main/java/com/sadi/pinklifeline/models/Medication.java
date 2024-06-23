package com.sadi.pinklifeline.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Embeddable
public class Medication {
    @Column(nullable = false)
    private String name;

    @Column(name = "dose_description", nullable = false)
    private String doseDescription;
}
