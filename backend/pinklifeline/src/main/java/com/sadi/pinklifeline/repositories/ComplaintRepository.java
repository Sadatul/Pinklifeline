package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.dtos.ComplaintDTO;
import com.sadi.pinklifeline.models.entities.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long>, JpaSpecificationExecutor<Complaint> {

    @Query("select new com.sadi.pinklifeline.models.dtos.ComplaintDTO(c.id, c.user.username, c.user.fullName, c.resourceId, c.type) from Complaint c where c.id = :id")
    Optional<ComplaintDTO> getComplaintDTOById(Long id);
}
