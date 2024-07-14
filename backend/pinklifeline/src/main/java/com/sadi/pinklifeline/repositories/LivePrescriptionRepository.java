package com.sadi.pinklifeline.repositories;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.models.reqeusts.LivePrescriptionReq;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Repository
public class LivePrescriptionRepository {
    private final RedisTemplate<String, String> userRedisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${live.prescription.prefix}")
    private String cachePrefix;

    @Value("${live.prescription.expiration.hours}")
    private Integer cacheExpirationDays;

    public LivePrescriptionRepository(RedisTemplate<String, String> userRedisTemplate, ObjectMapper objectMapper) {
        this.userRedisTemplate = userRedisTemplate;
        this.objectMapper = objectMapper;
    }

    public void putLivePrescription(LivePrescriptionReq req) throws JsonProcessingException {
        userRedisTemplate.opsForValue().set(cachePrefix + req.getCallId(),
                objectMapper.writeValueAsString(req),
                cacheExpirationDays, TimeUnit.HOURS);
    }

    public Optional<LivePrescriptionReq> getLivePrescription(LivePrescriptionReq req) throws JsonProcessingException {
        String data = userRedisTemplate.opsForValue().get(cachePrefix + req.getCallId());
        if (data == null) {
            return Optional.empty();
        }
        return Optional.of(objectMapper.readValue(data, LivePrescriptionReq.class));
    }
}
