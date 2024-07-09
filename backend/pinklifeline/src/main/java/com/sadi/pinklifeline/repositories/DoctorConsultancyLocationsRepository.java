package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.DoctorConsultationLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorConsultancyLocationsRepository extends JpaRepository<DoctorConsultationLocation, Long> {
}
