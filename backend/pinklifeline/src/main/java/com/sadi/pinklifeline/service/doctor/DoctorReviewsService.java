package com.sadi.pinklifeline.service.doctor;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.dtos.RatingCountPair;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.entities.DoctorReview;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.DoctorReviewReq;
import com.sadi.pinklifeline.models.reqeusts.ReviewUpdateReq;
import com.sadi.pinklifeline.models.responses.ReviewSummaryRes;
import com.sadi.pinklifeline.repositories.ReviewCachingRepository;
import com.sadi.pinklifeline.repositories.reviews.DoctorReviewsRepository;
import com.sadi.pinklifeline.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.util.Pair;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Objects;
import java.util.stream.IntStream;

@Service
@Slf4j
public class DoctorReviewsService {
    private final DoctorsInfoService doctorsInfoService;
    private final UserService userService;
    private final DoctorReviewsRepository reviewsRepository;
    private final ReviewCachingRepository reviewCachingRepository;

    public DoctorReviewsService(DoctorsInfoService doctorsInfoService, UserService userService, DoctorReviewsRepository reviewsRepository, ReviewCachingRepository reviewCachingRepository) {
        this.doctorsInfoService = doctorsInfoService;
        this.userService = userService;
        this.reviewsRepository = reviewsRepository;
        this.reviewCachingRepository = reviewCachingRepository;
    }

    public DoctorReview getReview(Long reviewId) {
        return reviewsRepository.findById(reviewId).orElseThrow(
                () -> new ResourceNotFoundException(String.format("Review with id %s not found", reviewId))
        );
    }

    public void verifyReviewAccess(DoctorReview review, Long userId){
        if(!Objects.equals(review.getReviewer().getId(), userId)){
            throw new AuthorizationDeniedException(
                    String.format("User with id:%d doesn't have access to the location: %d", userId, review.getId()),
                    () -> false);
        }
    }

    @PreAuthorize("#userId.toString() == authentication.name")
    public Pair<Long, ReviewSummaryRes> addReview(DoctorReviewReq req, Long userId) throws JsonProcessingException {
        User reviewer = userService.getUserIfRegistered(userId);
        DoctorDetails doctorDetails = doctorsInfoService.getDoctorIfVerified(req.getId());
        DoctorReview review = new DoctorReview(doctorDetails, reviewer, req.getRating(), LocalDateTime.now());
        review.setComment(req.getComment());

        Long id = reviewsRepository.save(review).getId();
        Long[] lst = addReviewRatingCountPairUpdate(req.getRating(),
                doctorDetails.getUserId(), "doctor");
        return Pair.of(id, getReviewSummaryRes(lst));
    }

    @PreAuthorize("#userId.toString() == authentication.name")
    public ReviewSummaryRes updateReview(ReviewUpdateReq req, Long userId, Long reviewId) throws JsonProcessingException {
        DoctorReview review = getReview(reviewId);
        Integer prevRating = review.getRating();
        verifyReviewAccess(review, userId);
        review.setComment(req.getComment());
        review.setRating(req.getRating());
        review.setTimestamp(LocalDateTime.now());
        reviewsRepository.save(review);

        Long[] lst = updateReviewRatingCountPairUpdate(req.getRating(), review.getDoctorDetails().getUserId(),
                prevRating, "doctor");
        return getReviewSummaryRes(lst);
    }

    private ReviewSummaryRes getReviewSummaryRes(Long[] lst) {
        long count = Arrays.stream(lst).mapToLong(Long::longValue).sum();
        double avg = 0.0;
        if(count != 0){
            avg = IntStream.range(0, 5).mapToLong(i -> (i + 1) * lst[i]).sum() / (double) count;
        }
        return new ReviewSummaryRes(count, avg, lst);
    }

    @PreAuthorize("#userId.toString() == authentication.name")
    public ReviewSummaryRes deleteReview(Long userId, Long reviewId) throws JsonProcessingException {
        DoctorReview review = getReview(reviewId);
        Integer prevRating = review.getRating();
        verifyReviewAccess(review, userId);
        reviewsRepository.delete(review);

        Long[] lst = deleteReviewRatingCountPairUpdate(prevRating, review.getDoctorDetails().getUserId(), "doctor");
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
        Long[] lst = RatingCountPair.ListRatingCountPairToLongArr(reviewsRepository.getRatingByDoctorId(id));
        try {
            reviewCachingRepository.putRatingCount(id, lst, type);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return lst;
    }
}
