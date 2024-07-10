package com.sadi.pinklifeline.repositories.reviews;

import com.sadi.pinklifeline.models.dtos.RatingCountPair;
import com.sadi.pinklifeline.models.entities.DoctorReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorReviewsRepository extends JpaRepository<DoctorReview, Long> {
    @Query("select new com.sadi.pinklifeline.models.dtos.RatingCountPair(r.rating, count(r.id)) from DoctorReview r where r.doctorDetails.userId = :doctorId group by r.rating order by r.rating")
    List<RatingCountPair> getRatingByDoctorId(Long doctorId);

    @Query("select avg(r.rating) from DoctorReview r where r.doctorDetails.userId = :doctorId")
    Double getAvgRatingByDoctorID(Long doctorId);

    @Query("select count(r.id) from DoctorReview r where r.doctorDetails.userId = :doctorId")
    Long getReviewCountByDoctorId(Long doctorId);
}
