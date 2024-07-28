package com.sadi.pinklifeline.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@Entity
@NoArgsConstructor
@Table(name = "shared_reports")
public class SharedReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "doctor_id", nullable = false)
    private DoctorDetails doctor;

    @Column(name = "expiration_time")
    private LocalDateTime expirationTime;

    public SharedReport(Report report, DoctorDetails doctor, LocalDateTime expirationTime) {
        this.report = report;
        this.doctor = doctor;
        this.expirationTime = expirationTime;
    }
}
