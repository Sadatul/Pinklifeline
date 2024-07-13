package com.sadi.pinklifeline.models.entities;

import com.sadi.pinklifeline.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Getter
@Setter
@ToString
@Table(name = "appointments")
public class Appointment{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "patient_id", nullable = false)
    private User user; // Can be any role

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "doctor_id", nullable = false)
    private DoctorDetails doctor;

    @Column(name = "patient_contact_number", nullable = false)
    private String patientContactNumber;

    @Column(nullable = false)
    private LocalDate date;

    private LocalTime time;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    @ToString.Exclude
    private DoctorConsultationLocation location;

    @Column(name = "is_online", nullable = false)
    private Boolean isOnline;

    @Column(name = "is_payment_complete", nullable = false)
    private Boolean isPaymentComplete;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    public Appointment() {
        timestamp = LocalDateTime.now();
        status = AppointmentStatus.REQUESTED;
        isPaymentComplete = false;
    }
}
