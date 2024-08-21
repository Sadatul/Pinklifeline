package com.sadi.pinklifeline.repositories.hospital;

import com.sadi.pinklifeline.models.entities.hospital.Hospital;
import com.sadi.pinklifeline.models.entities.hospital.HospitalTest;
import com.sadi.pinklifeline.models.entities.hospital.MedicalTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HospitalTestRepository extends JpaRepository<HospitalTest, Long> {
    boolean existsByHospitalAndTest(Hospital hospital, MedicalTest test);
}
