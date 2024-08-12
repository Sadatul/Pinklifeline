package com.sadi.pinklifeline.repositories;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Repository
public class OnlineMeetingRepository {
    private final RedisTemplate<String, String> userRedisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${online.meeting.prefix}")
    private String cachePrefix;

    @Value("${online.meeting.expiration.hours}")
    private Integer cacheExpirationDays;

    public OnlineMeetingRepository(RedisTemplate<String, String> userRedisTemplate, ObjectMapper objectMapper) {
        this.userRedisTemplate = userRedisTemplate;
        this.objectMapper = objectMapper;
    }

    public void putAppIdAndCallIdForMeeting(Long userId, Pair<Long, String> data) throws JsonProcessingException {
        userRedisTemplate.opsForValue().set(cachePrefix + userId,
                objectMapper.writeValueAsString(data),
                cacheExpirationDays, TimeUnit.HOURS);
    }

    public Optional<Pair<Long, String>> getAppIdAndCallIdForMeeting(Long userId) throws JsonProcessingException {
        String data = userRedisTemplate.opsForValue().get(cachePrefix + userId);
        if (data == null) {
            return Optional.empty();
        }
        return Optional.of(objectMapper.readValue(data, new TypeReference<>() {}));
    }

    public Boolean ifUserInMeeting(Long userId) {
        return userRedisTemplate.hasKey(cachePrefix + userId);
    }
    public void deleteMeetingData(Long userId) {
        userRedisTemplate.delete(cachePrefix + userId);
    }
}
