package com.sadi.pinklifeline.repositories;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.models.dtos.RatingAvgAndRatingCountPair;
import com.sadi.pinklifeline.models.dtos.RatingCountPair;
import com.sadi.pinklifeline.models.dtos.UnverifiedUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Repository
public class ReviewCachingRepository {
    private final RedisTemplate<String, String> userRedisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${cache.reviews.doctor}")
    private String cachePrefixDoctor;

    @Value("${cache.expiration.days}")
    private Integer cacheExpirationDays;


    public ReviewCachingRepository(RedisTemplate<String, String> userRedisTemplate, ObjectMapper objectMapper) {
        this.userRedisTemplate = userRedisTemplate;
        this.objectMapper = objectMapper;
    }

    public void putRatingAvgData(Long id, RatingAvgAndRatingCountPair value, String type) throws JsonProcessingException {
        String prefix = getReviewPrefix(type);
        userRedisTemplate.opsForValue().set(prefix + id + ":avg",
                objectMapper.writeValueAsString(value),
                cacheExpirationDays, TimeUnit.DAYS);
    }

    public void putRatingCount(Long id, Long[] ratingCount, String type) throws JsonProcessingException {
        String prefix = getReviewPrefix(type);
        userRedisTemplate.opsForValue().set(prefix + id + ":ratingCount",
                objectMapper.writeValueAsString(ratingCount),
                cacheExpirationDays, TimeUnit.DAYS);
    }

    public Optional<RatingAvgAndRatingCountPair> getRatingAvgData(Long id, String type) throws JsonProcessingException {
        String prefix = getReviewPrefix(type);
        String data = userRedisTemplate.opsForValue().get(prefix + id + ":avg");
        if (data == null) {
            return Optional.empty();
        }
        return Optional.of(objectMapper.readValue(data, RatingAvgAndRatingCountPair.class));
    }

    public Optional<Long[]> getRatingCount(Long id, String type) throws JsonProcessingException {
        String prefix = getReviewPrefix(type);
        String data = userRedisTemplate.opsForValue().get(prefix + id + ":ratingCount");
        if (data == null) {
            return Optional.empty();
        }
        return Optional.of(objectMapper.readValue(data, Long[].class));
    }

    private String getReviewPrefix(String type) {
        if(type.equalsIgnoreCase("doctor")){
            return cachePrefixDoctor;
        }
        return "cache:default";
    }
}