package com.sadi.pinklifeline.repositories.hospital;

import com.sadi.pinklifeline.models.dtos.RatingCountPair;
import com.sadi.pinklifeline.models.entities.hospital.HospitalReview;
import com.sadi.pinklifeline.models.responses.ReviewRes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface HospitalReviewsRepository extends JpaRepository<HospitalReview, Long> {
    @Query("select count(hr.id) > 0 from HospitalReview hr where hr.hospital.id = :hospitalId and hr.reviewer.id = :reviewerId")
    Boolean existsByHospitalIdAndReviewerId(Long hospitalId, Long reviewerId);

    @Query("select new com.sadi.pinklifeline.models.dtos.RatingCountPair(r.rating, count(r.id)) from HospitalReview r where r.hospital.id = :id group by r.rating order by r.rating")
    List<RatingCountPair> getRatingByResourceId(Long id);

    @Query("select new com.sadi.pinklifeline.models.responses.ReviewRes(hr.id, hr.reviewer.id, hr.reviewer.fullName, hr.reviewer.profilePicture, hr.comment, hr.rating, hr.timestamp) from HospitalReview hr where hr.hospital.id = :id order by hr.timestamp desc")
    List<ReviewRes> getHospitalReviewsByHospitalId(Long id);
}
