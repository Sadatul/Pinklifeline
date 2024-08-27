package com.sadi.pinklifeline.service.doctor;

import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.dtos.RatingCountPair;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.entities.DoctorReview;
import com.sadi.pinklifeline.models.entities.Review;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.RegisterReviewReq;
import com.sadi.pinklifeline.models.responses.ReviewRes;
import com.sadi.pinklifeline.repositories.ReviewCachingRepository;
import com.sadi.pinklifeline.repositories.reviews.DoctorReviewsRepository;
import com.sadi.pinklifeline.service.AbstractReviewHandlerService;
import com.sadi.pinklifeline.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Service
@Slf4j
public class DoctorReviewsService extends AbstractReviewHandlerService {
    private final DoctorsInfoService doctorsInfoService;
    private final UserService userService;
    private final DoctorReviewsRepository reviewsRepository;

    public DoctorReviewsService(DoctorsInfoService doctorsInfoService, UserService userService,
                                DoctorReviewsRepository reviewsRepository,
                                ReviewCachingRepository reviewCachingRepository) {
        super(reviewCachingRepository);
        this.doctorsInfoService = doctorsInfoService;
        this.userService = userService;
        this.reviewsRepository = reviewsRepository;
    }

    @Override
    public Review getReview(Long reviewId) {
        return reviewsRepository.findById(reviewId).orElseThrow(
                () -> new ResourceNotFoundException(String.format("Review with id %s not found", reviewId))
        );
    }

    @Override
    public void validateIfReviewExists(Long reviewerId, Long resourceId){
        Optional<Long> id = reviewsRepository.findReviewIdByReviewerIdAndDoctorId(reviewerId, resourceId);
        if(id.isPresent()){
            throw new BadRequestFromUserException(
                    String.format("Review for doctor with id: %d from user: %d already exists", resourceId, reviewerId));
        }
    }

    @Override
    public boolean resourceExists(Long resourceId) {
        return doctorsInfoService.existsById(resourceId);
    }

    @Override
    public Review getNewReview(Long reviewerId, RegisterReviewReq req) {
        User reviewer = userService.getUserIfRegisteredOnlyId(reviewerId);
        DoctorDetails doctorDetails = doctorsInfoService.getDoctorIfVerified(req.getId());
        DoctorReview review = new DoctorReview(doctorDetails, reviewer, req.getRating(), LocalDateTime.now());
        review.setComment(req.getComment());
        return review;
    }

    @Override
    public List<RatingCountPair> getReviewRatingCountPairList(Long reviewId) {
        return reviewsRepository.getRatingByResourceId(reviewId);
    }

    @Override
    public Review saveReview(Review review){
        return reviewsRepository.save((DoctorReview) review);
    }

    @Override
    public void deleteReview(Review review){
        reviewsRepository.delete((DoctorReview)review);
    }

    @Override
    public List<ReviewRes> getReviewsByResourceId(Long resourceId){
        return reviewsRepository.getDoctorReviewsByDoctorId(resourceId);
    }

}
