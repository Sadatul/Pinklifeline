package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.DoctorConsultationLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorConsultancyLocationsRepository extends JpaRepository<DoctorConsultationLocation, Long> {
    @Query("select dl from DoctorConsultationLocation dl where dl.doctorDetails.userId = :id")
    List<DoctorConsultationLocation> findByDoctorId(Long id);
}
