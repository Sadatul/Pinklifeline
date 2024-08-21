package com.sadi.pinklifeline.service.hospital;

import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.dtos.RatingCountPair;
import com.sadi.pinklifeline.models.entities.Review;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.entities.hospital.Hospital;
import com.sadi.pinklifeline.models.entities.hospital.HospitalReview;
import com.sadi.pinklifeline.models.reqeusts.RegisterReviewReq;
import com.sadi.pinklifeline.models.responses.ReviewRes;
import com.sadi.pinklifeline.repositories.ReviewCachingRepository;
import com.sadi.pinklifeline.repositories.hospital.HospitalReviewsRepository;
import com.sadi.pinklifeline.service.AbstractReviewHandlerService;
import com.sadi.pinklifeline.service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HospitalReviewsService extends AbstractReviewHandlerService {
    private final UserService userService;
    private final HospitalReviewsRepository hospitalReviewsRepository;
    private final HospitalHandlerService hospitalHandlerService;

    public HospitalReviewsService(UserService userService,
                                  HospitalReviewsRepository hospitalReviewsRepository,
                                  ReviewCachingRepository reviewCachingRepository, HospitalHandlerService hospitalHandlerService) {
        super(reviewCachingRepository);
        this.userService = userService;
        this.hospitalReviewsRepository = hospitalReviewsRepository;
        this.hospitalHandlerService = hospitalHandlerService;
    }

    @Override
    public Review saveReview(Review review) {
        return hospitalReviewsRepository.save((HospitalReview) review);
    }

    @Override
    public void deleteReview(Review review) {
        hospitalReviewsRepository.delete((HospitalReview) review);
    }

    @Override
    public Review getReview(Long reviewId) {
        return hospitalReviewsRepository.findById(reviewId).orElseThrow(
                () -> new ResourceNotFoundException(String.format("Review with id %s not found", reviewId))
        );
    }

    @Override
    public Review getNewReview(Long reviewerId, RegisterReviewReq req) {
        User user = userService.getUserIfRegisteredOnlyId(reviewerId);
        Hospital hospital = hospitalHandlerService.getHospital(req.getId());
        HospitalReview review = new HospitalReview(hospital, user, req.getRating());
        review.setComment(req.getComment());
        return review;
    }

    @Override
    public List<RatingCountPair> getReviewRatingCountPairList(Long reviewId) {
        return hospitalReviewsRepository.getRatingByResourceId(reviewId);
    }

    @Override
    public void validateIfReviewExists(Long reviewerId, Long resourceId) {
        if(hospitalReviewsRepository.existsByHospitalIdAndReviewerId(resourceId, reviewerId)) {
            throw new BadRequestFromUserException(
                    String.format("Review for hospital with id: %d from user: %d already exists", resourceId, reviewerId));
        }
    }

    @Override
    public boolean resourceExists(Long resourceId) {
        return hospitalHandlerService.existsById(resourceId);
    }

    @Override
    public List<ReviewRes> getReviewsByResourceId(Long resourceId) {
        return hospitalReviewsRepository.getHospitalReviewsByHospitalId(resourceId);
    }
}
