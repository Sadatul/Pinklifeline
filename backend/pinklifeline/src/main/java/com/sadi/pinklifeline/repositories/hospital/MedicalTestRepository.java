package com.sadi.pinklifeline.repositories.hospital;

import com.sadi.pinklifeline.models.entities.hospital.MedicalTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicalTestRepository extends JpaRepository<MedicalTest, Long>, JpaSpecificationExecutor<MedicalTest> {
}
