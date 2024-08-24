package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.PaidWork;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaidWorkRepository extends JpaRepository<PaidWork, Long>, JpaSpecificationExecutor<PaidWork> {
    @Lock(LockModeType.OPTIMISTIC)
    Optional<PaidWork> findWithLockingById(Long id);
}
