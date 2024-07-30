package com.sadi.pinklifeline.repositories;

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

    // transId is unique by itself, but we are adding type and id as a validation. When user tries to validate, it will ensure that the validation is done for same resource
    public void putUserSessionKey(String transId, String type, Long id, String sessionKey) {
        userRedisTemplate.opsForValue().set(redisKeyPrefix + type  + id  + transId,
                sessionKey,
                expiration, TimeUnit.SECONDS);
    }

    public Optional<String> getUserSessionKey(String transId, String type, Long id) {
        String data = userRedisTemplate.opsForValue().get(redisKeyPrefix + type + id + transId);
        if (data == null) {
            return Optional.empty();
        }
        return Optional.of(data);
    }

    public void deleteUserSessionKeyByTransId(String transId, String type, Long id) {
        userRedisTemplate.delete(redisKeyPrefix + type + id + transId);
    }
}
