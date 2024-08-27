package com.sadi.pinklifeline.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.reqeusts.RegisterReviewReq;
import com.sadi.pinklifeline.models.reqeusts.ReviewUpdateReq;
import com.sadi.pinklifeline.models.responses.ReviewRes;
import com.sadi.pinklifeline.models.responses.ReviewSummaryRes;
import com.sadi.pinklifeline.service.AbstractReviewHandlerService;
import com.sadi.pinklifeline.service.doctor.DoctorReviewsService;
import com.sadi.pinklifeline.service.hospital.HospitalReviewsService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.util.Pair;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/v1/reviews")
@Slf4j
public class ReviewsHandlerV1 {

    public final DoctorReviewsService doctorReviewsService;
    private final HospitalReviewsService hospitalReviewsService;

    public ReviewsHandlerV1(DoctorReviewsService doctorReviewsService, HospitalReviewsService hospitalReviewsService) {
        this.doctorReviewsService = doctorReviewsService;
        this.hospitalReviewsService = hospitalReviewsService;
    }

    @PostMapping("/{type}/{user_id}")
    public ResponseEntity<ReviewSummaryRes> addReview(
            @PathVariable(name = "type") String type,
            @PathVariable(name = "user_id") Long userId,
            @Valid @RequestBody RegisterReviewReq req) throws JsonProcessingException {
        log.debug("Post request on {} review received: {}", type, req);
        AbstractReviewHandlerService reviewsService = reviewHandlerServiceFactory(type);
        Pair<Long, ReviewSummaryRes> pair = reviewsService.addReview(req, userId, type);
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
        log.debug("Put request on {} review received: {}", type, req);
        AbstractReviewHandlerService reviewsService = reviewHandlerServiceFactory(type);
        ReviewSummaryRes res = reviewsService.updateReview(req, userId, reviewId, type);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{type}/{user_id}/{review_id}")
    public ResponseEntity<ReviewSummaryRes> deleteReview(
            @PathVariable(name = "type") String type,
            @PathVariable(name = "user_id") Long userId,
            @PathVariable(name = "review_id") Long reviewId) throws JsonProcessingException {
        log.debug("Delete request on {} review received: {}", type,reviewId);
        AbstractReviewHandlerService reviewsService = reviewHandlerServiceFactory(type);
        ReviewSummaryRes res = reviewsService.deleteReview(userId, reviewId, type);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{type}/{resource_id}")
    public ResponseEntity<List<ReviewRes>> getReviewsForResource(
            @PathVariable(name = "type") String type,
            @PathVariable(name = "resource_id") Long resourceId
    ){
        AbstractReviewHandlerService reviewsService = reviewHandlerServiceFactory(type);
        List<ReviewRes> res = reviewsService.getReviewsIfResourceExists(resourceId, type);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{type}/{resource_id}/summary")
    public ResponseEntity<ReviewSummaryRes> getReviewSummaryForResource(
            @PathVariable(name = "type") String type,
            @PathVariable(name = "resource_id") Long resourceId
    ){
        AbstractReviewHandlerService reviewsService = reviewHandlerServiceFactory(type);
        ReviewSummaryRes res = reviewsService.getReviewSummaryResIfResourceExists(resourceId, type);
        return ResponseEntity.ok(res);
    }

    private AbstractReviewHandlerService reviewHandlerServiceFactory(String type){
        if(type.equals("doctor")){
            return doctorReviewsService;
        }
        else if(type.equals("hospital")){
            return hospitalReviewsService;
        }
        throw new ResourceNotFoundException("URI not found");
    }
}
