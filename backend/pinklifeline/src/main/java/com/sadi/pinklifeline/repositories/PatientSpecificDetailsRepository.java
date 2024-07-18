package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.PatientSpecificDetails;
import com.sadi.pinklifeline.models.responses.PatientResForeign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PatientSpecificDetailsRepository extends JpaRepository<PatientSpecificDetails, Long> {
    @Query("select new com.sadi.pinklifeline.models.responses.PatientResForeign(p.cancerStage, p.diagnosisDate) from PatientSpecificDetails p where p.userId = :id")
    Optional<PatientResForeign> findByPatientByUserIdForeign(Long id);
}
