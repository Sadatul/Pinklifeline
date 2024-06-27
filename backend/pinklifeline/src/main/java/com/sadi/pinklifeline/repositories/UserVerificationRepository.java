package com.sadi.pinklifeline.repositories;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.models.dtos.UnverifiedUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Repository
public class UserVerificationRepository {
    private final RedisTemplate<String, String> userRedisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${verification.email.redis.prefix}")
    private String redisKeyPrefix;

    @Value("${verification.email.timeout}")
    private Long optExpiration;

    public UserVerificationRepository(RedisTemplate<String, String> userRedisTemplate, ObjectMapper objectMapper) {
        this.userRedisTemplate = userRedisTemplate;
        this.objectMapper = objectMapper;
    }

    public void putUserVerificationInfo(String username, UnverifiedUser unverifiedUser) throws JsonProcessingException {
        userRedisTemplate.opsForValue().set(redisKeyPrefix + username,
                objectMapper.writeValueAsString(unverifiedUser),
                optExpiration, TimeUnit.SECONDS);
    }

    public Optional<UnverifiedUser> getUserVerificationInfoByUsername(String username) throws JsonProcessingException {
        String data = userRedisTemplate.opsForValue().get(redisKeyPrefix + username);
        if (data == null) {
            return Optional.empty();
        }
        return Optional.of(objectMapper.readValue(data, UnverifiedUser.class));
    }

    public void deleteUserVerInfoByUsername(String username) {
        userRedisTemplate.delete(redisKeyPrefix + username);
    }
}
