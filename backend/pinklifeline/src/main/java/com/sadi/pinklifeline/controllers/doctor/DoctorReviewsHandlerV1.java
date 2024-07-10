package com.sadi.pinklifeline.controllers.doctor;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.sadi.pinklifeline.models.reqeusts.DoctorReviewReq;
import com.sadi.pinklifeline.models.reqeusts.ReviewUpdateReq;
import com.sadi.pinklifeline.models.responses.ReviewSummaryRes;
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
public class DoctorReviewsHandlerV1 {

    public final DoctorReviewsService reviewsService;

    public DoctorReviewsHandlerV1(DoctorReviewsService reviewsService) {
        this.reviewsService = reviewsService;
    }

    @PostMapping("/doctor/{user_id}")
    public ResponseEntity<ReviewSummaryRes> addReview(
            @PathVariable(name = "user_id") Long userId,
            @Valid @RequestBody DoctorReviewReq req) throws JsonProcessingException {
        log.debug("Post request on doctor review received: {}", req);
        Pair<Long, ReviewSummaryRes> pair = reviewsService.addReview(req, userId);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(pair.getFirst()).toUri();
        return ResponseEntity.created(uri).body(pair.getSecond());
    }

    @PutMapping("/doctor/{user_id}/{review_id}")
    public ResponseEntity<ReviewSummaryRes> updateReview(
            @PathVariable(name = "user_id") Long userId,
            @PathVariable(name = "review_id") Long reviewId,
            @Valid @RequestBody ReviewUpdateReq req) throws JsonProcessingException {
        log.debug("Put request on doctor review received: {}", req);
        ReviewSummaryRes res = reviewsService.updateReview(req, userId, reviewId);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/doctor/{user_id}/{review_id}")
    public ResponseEntity<ReviewSummaryRes> deleteReview(
            @PathVariable(name = "user_id") Long userId,
            @PathVariable(name = "review_id") Long reviewId) throws JsonProcessingException {
        log.debug("Delete request on doctor review received: {}", reviewId);
        ReviewSummaryRes res = reviewsService.deleteReview(userId, reviewId);
        return ResponseEntity.ok(res);
    }
}
