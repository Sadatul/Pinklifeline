package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.models.entities.BalanceHistory;
import com.sadi.pinklifeline.repositories.BalanceHistoryRepository;
import com.sadi.pinklifeline.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BalanceService {
    private final BalanceHistoryRepository balanceHistoryRepository;

    @Value("${balance.history.page-size}")
    private Integer pageSize;

    public BalanceService(BalanceHistoryRepository balanceHistoryRepository) {
        this.balanceHistoryRepository = balanceHistoryRepository;
    }

    public Integer getBalanceForUser(){
        Long id = SecurityUtils.getOwnerID();
        return  balanceHistoryRepository.getBalanceForUserId(id).orElse(0);
    }

    public Page<Map<String, Object>> getBalanceHistoryForUser(Integer pageNo){
        Long id = SecurityUtils.getOwnerID();
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<BalanceHistory> result = balanceHistoryRepository.getBalanceHistoriesByUserId(id, pageable);
        List<Map<String, Object>> mapList = result.getContent().stream().map((balanceHistory) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", balanceHistory.getId());
            map.put("description", balanceHistory.getDescription());
            map.put("value", balanceHistory.getValue());
            map.put("timestamp", balanceHistory.getTimestamp());
            return map;
        }).toList();

        return new PageImpl<>(mapList, pageable, result.getTotalElements());
    }
}
