package com.sadi.pinklifeline.repositories;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Repository
public class ReviewCachingRepository {
    private final RedisTemplate<String, String> userRedisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${cache.reviews.prefix}")
    private String cachePrefix;


    @Value("${cache.expiration.days}")
    private Integer cacheExpirationDays;


    public ReviewCachingRepository(RedisTemplate<String, String> userRedisTemplate, ObjectMapper objectMapper) {
        this.userRedisTemplate = userRedisTemplate;
        this.objectMapper = objectMapper;
    }

    public void putRatingCount(Long id, Long[] ratingCount, String type) throws JsonProcessingException {
        String prefix = getReviewPrefix(type);
        userRedisTemplate.opsForValue().set(prefix + id + ":ratingCount",
                objectMapper.writeValueAsString(ratingCount),
                cacheExpirationDays, TimeUnit.DAYS);
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
        return String.format("%s:%s:", cachePrefix, type);
    }

    public Optional<Long[]> addReviewRatingCountPairUpdate(Integer rating, Long id, String type)
            throws JsonProcessingException {
        Optional<Long[]> data = getRatingCount(id, type);
        if(data.isEmpty()){
            return Optional.empty();
        }
        Long[] lst = data.get();
        lst[rating - 1] += 1;
        putRatingCount(id, lst, type);
        return Optional.of(lst);
    }

    public Optional<Long[]> deleteReviewRatingCountPairUpdate(Integer rating, Long id, String type)
            throws JsonProcessingException {
        Optional<Long[]> data = getRatingCount(id, type);
        if(data.isEmpty()){
            return Optional.empty();
        }
        Long[] lst = data.get();
        lst[rating - 1] -= 1;
        putRatingCount(id, lst, type);
        return Optional.of(lst);
    }

    public Optional<Long[]> updateReviewRatingCountPairUpdate(Integer newRating, Long id, Integer prevRating, String type)
            throws JsonProcessingException {
        Optional<Long[]> data = getRatingCount(id, type);
        if(data.isEmpty()){
            return Optional.empty();
        }
        Long[] lst = data.get();
        lst[prevRating - 1] -= 1;
        lst[newRating - 1] += 1;
        putRatingCount(id, lst, type);
        return Optional.of(lst);
    }
}