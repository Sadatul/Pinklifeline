package com.sadi.pinklifeline.repositories.hospital;

import com.sadi.pinklifeline.models.entities.hospital.MedicalTest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalTestRepository extends JpaRepository<MedicalTest, Long>, JpaSpecificationExecutor<MedicalTest> {
    @Query("select mt.id, mt.name, case when :desc = true then mt.description else null end from MedicalTest mt where (:id is null or mt.id = :id) and (:name is null or mt.name like :name)")
    List<Object[]> findMedicalTests(String name, Long id, boolean desc, Sort sort);
}
