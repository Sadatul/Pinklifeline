package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.BlogVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogVoteRepository extends JpaRepository<BlogVote, Long> {
    @Query("select bv from BlogVote bv where bv.blog.id = :blogId and bv.user.id = :userId")
    Optional<BlogVote> findByBlogIdAndUserId(Long blogId, Long userId);
}
