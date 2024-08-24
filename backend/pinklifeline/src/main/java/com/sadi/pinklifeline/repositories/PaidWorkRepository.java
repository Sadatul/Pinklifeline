package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.enums.WorkTag;
import com.sadi.pinklifeline.models.dtos.PaidWorkDTO;
import com.sadi.pinklifeline.models.entities.PaidWork;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaidWorkRepository extends JpaRepository<PaidWork, Long>, JpaSpecificationExecutor<PaidWork> {
    @Lock(LockModeType.OPTIMISTIC)
    Optional<PaidWork> findWithLockingById(Long id);

    @Query("select new com.sadi.pinklifeline.models.dtos.PaidWorkDTO(pw.id, pw.user.id, pw.user.username, pw.user.fullName, pw.healCareProvider.userId, pw.title, pw.description, pw.address, pw.createdAt, pw.status) from PaidWork pw where pw.id = :id")
    Optional<PaidWorkDTO> findPaidWorkDTOById(Long id);

    @Query("select pw.tags from PaidWork pw where pw.id = :id")
    List<WorkTag> findWorkTagsById(Long id);
}
