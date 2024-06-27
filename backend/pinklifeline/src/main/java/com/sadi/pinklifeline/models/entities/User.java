package com.sadi.pinklifeline.models.entities;

import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.enums.YesNo;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Table(name="users")
@SecondaryTable(
        name = "profile_pictures",
        pkJoinColumns = @PrimaryKeyJoinColumn(name = "user_id")
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private  String username;

    @Column(nullable = false)
    private  String password;

    @Column(name = "is_registration_complete", columnDefinition = "ENUM('Y', 'N') DEFAULT 'N' NOT NULL")
    @Enumerated(EnumType.STRING)
    private YesNo isRegistrationComplete;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private List<Roles> roles;

    public User(String username, String password, List<Roles> roles) {
        this.username = username;
        this.password = password;
        this.roles = roles;
        this.isRegistrationComplete = YesNo.N;
    }

    public User(Long id, String username, String password, List<Roles> roles) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.roles = roles;
        this.isRegistrationComplete = YesNo.N;
    }

    @Column(table = "profile_pictures", name = "profile_picture", nullable = false)
    private String profilePicture;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private BasicUserDetails basicUser;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private PatientSpecificDetails patientSpecificDetails;
}
