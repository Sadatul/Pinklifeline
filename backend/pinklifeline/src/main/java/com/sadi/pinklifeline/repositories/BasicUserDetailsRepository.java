package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.BasicUserDetails;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface BasicUserDetailsRepository extends JpaRepository<BasicUserDetails, Long> {

    @Query("select bud.lastPeriodDate, bud.avgCycleLength from BasicUserDetails bud where bud.userId = :id")
    Optional<Object[]> getPeriodDataWithId(Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("update BasicUserDetails bud set bud.lastPeriodDate = :periodDate, bud.avgCycleLength = :avgLen where bud.userId = :id")
    void updatePeriodDataById(LocalDate periodDate, int avgLen, Long id);
}
