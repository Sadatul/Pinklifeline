package com.sadi.pinklifeline.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@ToString
@Table(name = "doctor_consultation_locations")
public class DoctorConsultationLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private DoctorDetails doctorDetails;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalTime start;

    @Column(nullable = false)
    private LocalTime end;

    @Column(nullable = false)
    private String workdays;

    @Column(nullable = false)
    private Integer fees;

    public DoctorConsultationLocation(String location, LocalTime start, LocalTime end,
                                      String workdays, DoctorDetails doctorDetails, Integer fees) {
        this.location = location;
        this.start = start;
        this.end = end;
        this.workdays = workdays;
        this.doctorDetails = doctorDetails;
        this.fees = fees;
    }
}
