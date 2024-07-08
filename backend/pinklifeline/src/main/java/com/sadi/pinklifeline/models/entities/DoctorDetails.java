package com.sadi.pinklifeline.models.entities;

import com.sadi.pinklifeline.enums.YesNo;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@ToString
@Table(name = "doctor_details")
public class DoctorDetails {
    @Id
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "registration_number", nullable = false)
    private String registrationNumber;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "doctor_qualifications", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "qualification", nullable = false)
    private List<String> qualifications;

    @Column(name = "workplace", nullable = false)
    private String workplace;

    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "designation", nullable = false)
    private String designation;

    @Column(name = "contact_number", nullable = false)
    private String contactNumber;

    @Column(name = "is_verified", columnDefinition = "ENUM('Y', 'N') DEFAULT 'N' NOT NULL")
    @Enumerated(EnumType.STRING)
    private YesNo isVerified;
}
