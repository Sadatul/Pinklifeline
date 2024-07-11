package com.sadi.pinklifeline.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.reqeusts.DoctorReviewReq;
import com.sadi.pinklifeline.models.reqeusts.ReviewUpdateReq;
import com.sadi.pinklifeline.models.responses.ReviewSummaryRes;
import com.sadi.pinklifeline.service.AbstractReviewHandlerService;
import com.sadi.pinklifeline.service.doctor.DoctorReviewsService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.util.Pair;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/v1/reviews")
@Slf4j
public class ReviewsHandlerV1 {

    public final DoctorReviewsService doctorReviewsService;

    public ReviewsHandlerV1(DoctorReviewsService doctorReviewsService) {
        this.doctorReviewsService = doctorReviewsService;
    }

    @PostMapping("/{type}/{user_id}")
    public ResponseEntity<ReviewSummaryRes> addReview(
            @PathVariable(name = "type") String type,
            @PathVariable(name = "user_id") Long userId,
            @Valid @RequestBody DoctorReviewReq req) throws JsonProcessingException {
        log.debug("Post request on doctor review received: {}", req);
        AbstractReviewHandlerService reviewsService = reviewHandlerServiceFactory(type);
        Pair<Long, ReviewSummaryRes> pair = reviewsService.addReview(req, userId);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(pair.getFirst()).toUri();
        return ResponseEntity.created(uri).body(pair.getSecond());
    }

    @PutMapping("/{type}/{user_id}/{review_id}")
    public ResponseEntity<ReviewSummaryRes> updateReview(
            @PathVariable(name = "type") String type,
            @PathVariable(name = "user_id") Long userId,
            @PathVariable(name = "review_id") Long reviewId,
            @Valid @RequestBody ReviewUpdateReq req) throws JsonProcessingException {
        log.debug("Put request on doctor review received: {}", req);
        AbstractReviewHandlerService reviewsService = reviewHandlerServiceFactory(type);
        ReviewSummaryRes res = reviewsService.updateReview(req, userId, reviewId);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{type}/{user_id}/{review_id}")
    public ResponseEntity<ReviewSummaryRes> deleteReview(
            @PathVariable(name = "type") String type,
            @PathVariable(name = "user_id") Long userId,
            @PathVariable(name = "review_id") Long reviewId) throws JsonProcessingException {
        log.debug("Delete request on doctor review received: {}", reviewId);
        AbstractReviewHandlerService reviewsService = reviewHandlerServiceFactory(type);
        ReviewSummaryRes res = reviewsService.deleteReview(userId, reviewId);
        return ResponseEntity.ok(res);
    }

    private AbstractReviewHandlerService reviewHandlerServiceFactory(String type){
        if(type.equals("doctor")){
            return doctorReviewsService;
        }

        throw new ResourceNotFoundException("URI not found");
    }
}
