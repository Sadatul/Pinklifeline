package com.sadi.pinklifeline.models.entities.hospital;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@Table(name = "medical_tests", indexes = {
        @Index(name = "index_medical_tests_name", columnList = "name")
})
public class MedicalTest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    public MedicalTest(String name, String description) {
        this.name = name;
        this.description = description;
    }
}
