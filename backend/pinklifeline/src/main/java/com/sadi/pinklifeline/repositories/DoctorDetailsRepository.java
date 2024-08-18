package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.DoctorDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface DoctorDetailsRepository extends JpaRepository<DoctorDetails, Long> {

    @Query("select dd.qualifications from DoctorDetails dd where dd.userId = :id")
    List<String> getDoctorQualificationsById(Long id);
}