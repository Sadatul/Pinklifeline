package com.sadi.pinklifeline.repositories.reviews;

import com.sadi.pinklifeline.models.dtos.RatingCountPair;
import com.sadi.pinklifeline.models.entities.DoctorReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorReviewsRepository extends JpaRepository<DoctorReview, Long>{
    @Query("select new com.sadi.pinklifeline.models.dtos.RatingCountPair(r.rating, count(r.id)) from DoctorReview r where r.doctorDetails.userId = :id group by r.rating order by r.rating")
    List<RatingCountPair> getRatingByResourceId(Long id);

    @Query("select r.id from DoctorReview r where r.reviewer.id = :reviewerId and r.doctorDetails.userId = :doctorId")
    Optional<Long> findReviewIdByReviewerIdAndDoctorId(Long reviewerId, Long doctorId);
}
