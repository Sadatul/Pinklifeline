package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface DoctorDetailsRepository extends JpaRepository<DoctorDetails, Long>, JpaSpecificationExecutor<DoctorDetails> {

    @Query("select dd.qualifications from DoctorDetails dd where dd.userId = :id")
    List<String> getDoctorQualificationsById(Long id);

    @Query("select dd.fullName, dd.user.username, dd.contactNumber from DoctorDetails dd where dd.userId = :id")
    List<String[]> getDocContactInfoById(Long id);

    @Query("select (count(d) > 0) from DoctorDetails d where d.userId = ?1 and d.isVerified = ?2")
    boolean existsByUserIdAndAndIsVerified(Long userId, YesNo isVerified);
}