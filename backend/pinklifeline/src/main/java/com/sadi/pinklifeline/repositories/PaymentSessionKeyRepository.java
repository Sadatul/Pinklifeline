package com.sadi.pinklifeline.repositories;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Repository
public class PaymentSessionKeyRepository {
    private final RedisTemplate<String, String> userRedisTemplate;

    @Value("${payment.redis.session.key.prefix}")
    private String redisKeyPrefix;

    @Value("${payment.redis.session.key.timeout}")
    private Long expiration;

    public PaymentSessionKeyRepository(RedisTemplate<String, String> userRedisTemplate) {
        this.userRedisTemplate = userRedisTemplate;
    }

    public void putUserSessionKey(String transId, String sessionKey) {
        userRedisTemplate.opsForValue().set(redisKeyPrefix + transId,
                sessionKey,
                expiration, TimeUnit.SECONDS);
    }

    public Optional<String> getUserSessionKey(String transId) throws JsonProcessingException {
        String data = userRedisTemplate.opsForValue().get(redisKeyPrefix + transId);
        if (data == null) {
            return Optional.empty();
        }
        return Optional.of(data);
    }

    public void deleteUserSessionKeyByTransId(String transId) {
        userRedisTemplate.delete(redisKeyPrefix + transId);
    }
}
