package com.sadi.pinklifeline.models.entities;
// The complete Patient details can be achieved by combining PatientSpecificDetails with BasicUserDetails

import com.sadi.pinklifeline.enums.CancerStages;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "patient_specific_details")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class PatientSpecificDetails {
    @Id
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    private User user;

    @Column(name = "cancer_stage", columnDefinition = "ENUM('STAGE_0', 'STAGE_1', 'STAGE_2'," +
            " 'STAGE_3', 'STAGE_4', 'SURVIVOR') NOT NULL")
    @Enumerated(EnumType.STRING)
    private CancerStages cancerStage;

    @Column(name = "diagnosis_date", nullable = false)
    private LocalDate diagnosisDate;

    @Column(nullable = false)
    private String location;

    public PatientSpecificDetails(Long userId, User user, CancerStages cancerStage, LocalDate diagnosisDate) {
        this.userId = userId;
        this.user = user;
        this.cancerStage = cancerStage;
        this.diagnosisDate = diagnosisDate;
    }
}
