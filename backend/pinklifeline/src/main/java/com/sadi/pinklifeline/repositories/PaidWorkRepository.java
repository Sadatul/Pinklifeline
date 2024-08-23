package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.PaidWork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PaidWorkRepository extends JpaRepository<PaidWork, Long>, JpaSpecificationExecutor<PaidWork> {
}
