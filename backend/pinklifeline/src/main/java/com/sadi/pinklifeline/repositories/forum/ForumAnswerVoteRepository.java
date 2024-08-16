package com.sadi.pinklifeline.repositories.forum;

import com.sadi.pinklifeline.models.entities.ForumAnswerVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ForumAnswerVoteRepository extends JpaRepository<ForumAnswerVote, Long> {
    @Query("select fav from ForumAnswerVote fav where fav.answer.id = :answerId and fav.user.id = :userId")
    Optional<ForumAnswerVote> findByAnswerIdAndUserId(Long answerId, Long userId);
}
