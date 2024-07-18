package com.sadi.pinklifeline.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.sadi.pinklifeline.models.dtos.RatingCountPair;
import com.sadi.pinklifeline.models.entities.Review;
import com.sadi.pinklifeline.models.reqeusts.RegisterReviewReq;
import com.sadi.pinklifeline.models.reqeusts.ReviewUpdateReq;
import com.sadi.pinklifeline.models.responses.ReviewRes;
import com.sadi.pinklifeline.models.responses.ReviewSummaryRes;
import com.sadi.pinklifeline.repositories.ReviewCachingRepository;
import org.springframework.data.util.Pair;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authorization.AuthorizationDeniedException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.IntStream;

public abstract class AbstractReviewHandlerService {
    private final ReviewCachingRepository reviewCachingRepository;

    protected AbstractReviewHandlerService(ReviewCachingRepository reviewCachingRepository) {
        this.reviewCachingRepository = reviewCachingRepository;
    }

    public abstract Review saveReview(Review review);
    public abstract void deleteReview(Review review);
    public abstract Review getReview(Long reviewId);
    public abstract Review getNewReview(Long reviewerId, RegisterReviewReq req);
    public abstract List<RatingCountPair> getReviewRatingCountPairList(Long reviewId);
    public abstract void validateIfReviewExists(Long reviewerId, Long resourceId);
    public abstract List<ReviewRes> getReviewsByResourceId(Long resourceId);

    public void verifyReviewAccess(Review review, Long userId){
        if(!Objects.equals(review.getReviewerId(), userId)){
            throw new AuthorizationDeniedException(
                    String.format("User with id:%d doesn't have access to the location: %d", userId, review.getId()),
                    () -> false);
        }
    }

    @PreAuthorize("#userId.toString() == authentication.name")
    public Pair<Long, ReviewSummaryRes> addReview(RegisterReviewReq req, Long userId) throws JsonProcessingException {
        validateIfReviewExists(userId, req.getId());
        Review review = getNewReview(userId, req);
        Long id = saveReview(review).getId();
        Long[] lst = addReviewRatingCountPairUpdate(req.getRating(),
                req.getId(), "doctor");
        return Pair.of(id, getReviewSummaryRes(lst));
    }

    @PreAuthorize("#userId.toString() == authentication.name")
    public ReviewSummaryRes updateReview(ReviewUpdateReq req, Long userId, Long reviewId) throws JsonProcessingException {
        Review review = getReview(reviewId);
        Integer prevRating = review.getRating();
        verifyReviewAccess(review, userId);
        review.setComment(req.getComment());
        review.setRating(req.getRating());
        review.setTimestamp(LocalDateTime.now());
        saveReview(review);

        Long[] lst = updateReviewRatingCountPairUpdate(req.getRating(), review.getResourceId(),
                prevRating, "doctor");
        return getReviewSummaryRes(lst);
    }

    @PreAuthorize("#userId.toString() == authentication.name")
    public ReviewSummaryRes deleteReview(Long userId, Long reviewId) throws JsonProcessingException {
        Review review = getReview(reviewId);
        Integer prevRating = review.getRating();
        verifyReviewAccess(review, userId);
        deleteReview(review);

        Long[] lst = deleteReviewRatingCountPairUpdate(prevRating, review.getResourceId(), "doctor");
        return getReviewSummaryRes(lst);
    }

    public Long[] addReviewRatingCountPairUpdate(Integer rating, Long id, String type) throws JsonProcessingException {
        return reviewCachingRepository.addReviewRatingCountPairUpdate(rating, id, type)
                .orElseGet(() -> refreshRatingCountPairCache(id, type));
    }

    public Long[] deleteReviewRatingCountPairUpdate(Integer rating, Long id, String type) throws JsonProcessingException {
        return reviewCachingRepository.deleteReviewRatingCountPairUpdate(rating, id, type)
                .orElseGet(() -> refreshRatingCountPairCache(id, type));
    }

    public Long[] updateReviewRatingCountPairUpdate(Integer newRating, Long id, Integer prevRating, String type)
            throws JsonProcessingException {
        return reviewCachingRepository.updateReviewRatingCountPairUpdate(newRating, id, prevRating, type)
                .orElseGet(() -> refreshRatingCountPairCache(id, type));

    }

    public Long[] refreshRatingCountPairCache(Long id, String type) {
        Long[] lst = RatingCountPair.ListRatingCountPairToLongArr(getReviewRatingCountPairList(id));
        try {
            reviewCachingRepository.putRatingCount(id, lst, type);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return lst;
    }

    protected ReviewSummaryRes getReviewSummaryRes(Long[] lst) {
        long count = Arrays.stream(lst).mapToLong(Long::longValue).sum();
        double avg = 0.0;
        if(count != 0){
            avg = IntStream.range(0, 5).mapToLong(i -> (i + 1) * lst[i]).sum() / (double) count;
        }
        return new ReviewSummaryRes(count, avg, lst);
    }
}
