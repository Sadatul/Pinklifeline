package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.BalanceHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BalanceHistoryRepository extends JpaRepository<BalanceHistory, Long> {

    @Query("select sum(bh.value) from BalanceHistory bh where bh.user.id = :userId")
    Optional<Integer> getBalanceForUserId(Long userId);

    @Query("select bh from BalanceHistory bh where bh.user.id = :userId order by bh.timestamp desc")
    Page<BalanceHistory> getBalanceHistoriesByUserId(Long userId, Pageable pageable);
}
