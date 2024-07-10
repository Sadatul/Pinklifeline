package com.sadi.pinklifeline.service.doctor;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.dtos.RatingAvgAndRatingCountPair;
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
import java.util.Objects;
import java.util.Optional;

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

    @PreAuthorize("#userId.toString() == authentication.name")
    public Pair<Long, ReviewSummaryRes> addReview(DoctorReviewReq req, Long userId) throws JsonProcessingException {
        User reviewer = userService.getUserIfRegistered(userId);
        DoctorDetails doctorDetails = doctorsInfoService.getDoctorIfVerified(req.getId());
        DoctorReview review = new DoctorReview(doctorDetails, reviewer, req.getRating(), LocalDateTime.now());
        review.setComment(req.getComment());

        Long id = reviewsRepository.save(review).getId();
        RatingAvgAndRatingCountPair pair = updateRatingAvgAndCountCache(req.getRating(), 1L, doctorDetails.getUserId(), 0);
        Long[] lst = addReviewRatingCountPairUpdate(req.getRating(), doctorDetails.getUserId());

        return Pair.of(id, new ReviewSummaryRes(pair.getCount(), pair.getAvg(), lst));
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
    public ReviewSummaryRes updateReview(ReviewUpdateReq req, Long userId, Long reviewId) throws JsonProcessingException {
        DoctorReview review = getReview(reviewId);
        Integer prevRating = review.getRating();
        verifyReviewAccess(review, userId);
        review.setComment(req.getComment());
        review.setRating(req.getRating());
        review.setTimestamp(LocalDateTime.now());
        reviewsRepository.save(review);

        RatingAvgAndRatingCountPair pair = updateRatingAvgAndCountCache(req.getRating(), 0L,review.getDoctorDetails().getUserId(), prevRating);
        Long[] lst = updateReviewRatingCountPairUpdate(req.getRating(), review.getDoctorDetails().getUserId(), prevRating);

        return new ReviewSummaryRes(pair.getCount(), pair.getAvg(), lst);
    }

    @PreAuthorize("#userId.toString() == authentication.name")
    public ReviewSummaryRes deleteReview(Long userId, Long reviewId) throws JsonProcessingException {
        DoctorReview review = getReview(reviewId);
        Integer prevRating = review.getRating();
        verifyReviewAccess(review, userId);
        reviewsRepository.delete(review);

        RatingAvgAndRatingCountPair pair = updateRatingAvgAndCountCache(0, -1L,review.getDoctorDetails().getUserId(), prevRating);
        Long[] lst = deleteReviewRatingCountPairUpdate(prevRating, review.getDoctorDetails().getUserId());

        return new ReviewSummaryRes(pair.getCount(), pair.getAvg(), lst);
    }

    public Long[] addReviewRatingCountPairUpdate(Integer rating, Long id) throws JsonProcessingException {
        Optional<Long[]> data = reviewCachingRepository.getRatingCount(id, "doctor");
        if(data.isPresent()){
            Long[] lst = data.get();
            lst[rating - 1] += 1;
            reviewCachingRepository.putRatingCount(id, lst, "doctor");
            return lst;
        }
        Long[] lst = RatingCountPair.ListRatingCountPairToLongArr(reviewsRepository.getRatingByDoctorId(id));
        reviewCachingRepository.putRatingCount(id, lst, "doctor");
        return lst;
    }

    public Long[] deleteReviewRatingCountPairUpdate(Integer rating, Long id) throws JsonProcessingException {
        Optional<Long[]> data = reviewCachingRepository.getRatingCount(id, "doctor");
        if(data.isPresent()){
            Long[] lst = data.get();
            lst[rating - 1] -= 1;
            reviewCachingRepository.putRatingCount(id, lst, "doctor");
            return lst;
        }
        Long[] lst = RatingCountPair.ListRatingCountPairToLongArr(reviewsRepository.getRatingByDoctorId(id));
        reviewCachingRepository.putRatingCount(id, lst, "doctor");
        return lst;
    }

    public Long[] updateReviewRatingCountPairUpdate(Integer newRating, Long id, Integer prevRating) throws JsonProcessingException {
        Optional<Long[]> data = reviewCachingRepository.getRatingCount(id, "doctor");
        if(data.isPresent()){
            Long[] lst = data.get();
            lst[prevRating - 1] -= 1;
            lst[newRating - 1] += 1;
            reviewCachingRepository.putRatingCount(id, lst, "doctor");
            return lst;
        }
        Long[] lst = RatingCountPair.ListRatingCountPairToLongArr(reviewsRepository.getRatingByDoctorId(id));
        reviewCachingRepository.putRatingCount(id, lst, "doctor");
        return lst;
    }

    public RatingAvgAndRatingCountPair updateRatingAvgAndCountCache(Integer rating,  Long countChange, Long id, Integer prevRating) throws JsonProcessingException {
        Optional<RatingAvgAndRatingCountPair> data = reviewCachingRepository.getRatingAvgData(id, "doctor");
        if(data.isPresent()){
            RatingAvgAndRatingCountPair pair = data.get();
            Long  count = pair.getCount();
            Double total = pair.getAvg() * count;
            pair.setCount(count + countChange);
            pair.setAvg((total + rating - prevRating) / pair.getCount());
            reviewCachingRepository.putRatingAvgData(id, pair, "doctor");
            return pair;
        }
        Long count = reviewsRepository.getReviewCountByDoctorId(id);
        Double avg = reviewsRepository.getAvgRatingByDoctorID(id);
        RatingAvgAndRatingCountPair pair = new RatingAvgAndRatingCountPair(avg, count);
        reviewCachingRepository.putRatingAvgData(id, pair, "doctor");
        return pair;
    }
}
