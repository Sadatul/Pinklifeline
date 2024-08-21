package com.sadi.pinklifeline.repositories.hospital;

import com.sadi.pinklifeline.models.entities.hospital.Hospital;
import com.sadi.pinklifeline.models.entities.hospital.HospitalTest;
import com.sadi.pinklifeline.models.entities.hospital.MedicalTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface HospitalTestRepository extends JpaRepository<HospitalTest, Long> {
    boolean existsByHospitalAndTest(Hospital hospital, MedicalTest test);

    @Query("select ht.id, ht.test.name, ht.test.description, ht.test.id, ht.fee from HospitalTest ht where ht.hospital.id = :hospitalId and (:namePattern is null or ht.test.name like :namePattern) and (:testIds is null or ht.test.id in :testIds)")
    List<Object[]> findMedicalTestByHospitalId(Long hospitalId, String namePattern, Set<Long> testIds);

    @Query("select ht.hospital.id, ht.fee from HospitalTest ht where ht.test.id = :testId and ht.hospital.id in :hospitalIdSet")
    Object[][] getFeesByTestIdInHospitalIdSet(Set<Long> hospitalIdSet, Long testId);
}
