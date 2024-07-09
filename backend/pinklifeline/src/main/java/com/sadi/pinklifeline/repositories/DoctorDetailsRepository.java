package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.DoctorDetails;
import org.springframework.data.jpa.repository.JpaRepository;


public interface DoctorDetailsRepository extends JpaRepository<DoctorDetails, Long> {
}