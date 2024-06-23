package com.sadi.pinklifeline.models;

import com.sadi.pinklifeline.enums.YesNo;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(name = "basic_users")
public class BasicUser {
    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "userId")
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private Double weight;

    @Column(nullable = false)
    private Double height;

    public BasicUser(LocalDateTime lastPeriodDate, String fullName,
                     Double weight, Double height, String address,
                     YesNo cancerHistory, int avgCycleLength) {
        this.lastPeriodDate = lastPeriodDate;
        this.fullName = fullName;
        this.weight = weight;
        this.height = height;
        this.address = address;
        this.cancerHistory = cancerHistory;
        this.avgCycleLength = avgCycleLength;
    }

    @Column(nullable = false)
    private String address;

    @Column(name = "cancer_history", nullable = false)
    @Enumerated(EnumType.STRING)
    private YesNo cancerHistory;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "cancer_relatives", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "relative", nullable = false)
    private List<String> cancerRelatives;

    @Column(nullable = false, name = "last_period_date")
    private LocalDateTime lastPeriodDate;

    @Column(nullable = false, name = "avg_cycle_length")
    private int avgCycleLength;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "period_irregularities",
            joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "irregularity", nullable = false)
    private List<String> periodIrregularities;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "alergies", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "alergy_name", nullable = false)
    private List<String> alergies;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "organs_with_cronic_condition", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "organ", nullable = false)
    private List<String> organsWithCronicCondition;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "medications", joinColumns = @JoinColumn(name = "user_id"))
    private List<Medication> medications;



}
