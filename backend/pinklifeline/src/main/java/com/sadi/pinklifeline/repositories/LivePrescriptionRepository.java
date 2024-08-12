package com.sadi.pinklifeline.repositories;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.models.dtos.LivePrescription;
import com.sadi.pinklifeline.models.entities.Medication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
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

    public void putLivePrescription(LivePrescription data, String callId) throws JsonProcessingException {
        userRedisTemplate.opsForValue().set(cachePrefix + callId,
                objectMapper.writeValueAsString(data),
                cacheExpirationDays, TimeUnit.HOURS);
    }

    public void updateLivePrescription(Double weight, Double height, String analysis,
                                       List<Medication> medications, List<String> tests, String callId) throws JsonProcessingException {
        LivePrescription livePrescription = getLivePrescription(callId).orElseGet(() -> new LivePrescription(null, null, null, null,
                null, null, null, null, analysis, medications, tests));
        livePrescription.setAnalysis(analysis);
        livePrescription.setMedications(medications);
        livePrescription.setTests(tests);
        livePrescription.setWeight(weight);
        livePrescription.setHeight(height);
        putLivePrescription(livePrescription, callId);
    }

    public Optional<LivePrescription> getLivePrescription(String callId) throws JsonProcessingException {
        String data = userRedisTemplate.opsForValue().get(cachePrefix + callId);
        if (data == null) {
            return Optional.empty();
        }
        return Optional.of(objectMapper.readValue(data, LivePrescription.class));
    }

    public void deleteLivePrescription(String callId) {
        userRedisTemplate.delete(cachePrefix + callId);
    }

    public Boolean doesLivePrescriptionExists(String callId) {
        return userRedisTemplate.hasKey(cachePrefix + callId);
    }
}
