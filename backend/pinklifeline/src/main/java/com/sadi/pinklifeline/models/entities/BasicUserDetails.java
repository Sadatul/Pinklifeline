package com.sadi.pinklifeline.models.entities;

import com.sadi.pinklifeline.enums.YesNo;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(name = "basic_users_details")
public class BasicUserDetails {
    @Id
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    @Column(nullable = false)
    private Double weight;

    @Column(nullable = false)
    private Double height;

    public BasicUserDetails(LocalDate lastPeriodDate, String fullName,
                     Double weight, Double height,
                     YesNo cancerHistory, int avgCycleLength) {
        this.lastPeriodDate = lastPeriodDate;
        this.fullName = fullName;
        this.weight = weight;
        this.height = height;
        this.cancerHistory = cancerHistory;
        this.avgCycleLength = avgCycleLength;
    }

    @Column(name = "cancer_history", nullable = false)
    @Enumerated(EnumType.STRING)
    private YesNo cancerHistory;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "cancer_relatives", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "relative", nullable = false)
    private List<String> cancerRelatives;

    @Column(nullable = false, name = "last_period_date")
    private LocalDate lastPeriodDate;

    @Column(nullable = false, name = "avg_cycle_length")
    private int avgCycleLength;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "period_irregularities",
            joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "irregularity", nullable = false)
    private List<String> periodIrregularities;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "allergies", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "allergy_name", nullable = false)
    private List<String> allergies;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "organs_with_chronic_condition", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "organ", nullable = false)
    private List<String> organsWithChronicCondition;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "medications", joinColumns = @JoinColumn(name = "user_id"))
    private List<Medication> medications;
}
