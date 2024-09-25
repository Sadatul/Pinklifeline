package com.sadi.pinklifeline.models.entities.hospital;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.Set;

@Entity
@Getter
@Setter
@ToString
@Table(name = "hospitals", indexes = {
        @Index(name = "index_hospitals_name", columnList = "name"),
        @Index(name = "index_hospitals_location", columnList = "location")
})
@NoArgsConstructor
public class Hospital {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String location;

    @Column(name = "contact_number", nullable = false)
    private String contactNumber;

    @Column(nullable = false)
    private String email;

    @OneToMany(mappedBy = "hospital", fetch = FetchType.LAZY)
    @ToString.Exclude
    private Set<HospitalTest> tests;

    public Hospital(String name, String description, String location, String contactNumber, String email) {
        this.name = name;
        this.description = description;
        this.location = location;
        this.contactNumber = contactNumber;
        this.email = email;
    }
}
