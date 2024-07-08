package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.DoctorDetails;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocDetailsRepository extends JpaRepository<DoctorDetails, Long> {
}
