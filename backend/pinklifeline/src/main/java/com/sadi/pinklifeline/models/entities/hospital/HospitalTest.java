package com.sadi.pinklifeline.models.entities.hospital;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@NoArgsConstructor
@ToString
@Table(name = "hospital_tests")
public class HospitalTest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "test_id", nullable = false)
    private MedicalTest test;

    @Column(nullable = false)
    private Integer fee;

    public HospitalTest(Hospital hospital, MedicalTest test, Integer fee) {
        this.hospital = hospital;
        this.test = test;
        this.fee = fee;
    }
}
