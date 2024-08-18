package com.sadi.pinklifeline.repositories.forum;

import com.sadi.pinklifeline.models.entities.ForumQuestionVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ForumQuestionVoteRepository extends JpaRepository<ForumQuestionVote, Long> {
    @Query("select fqv from ForumQuestionVote fqv where fqv.question.id = :questionId and fqv.user.id = :userId")
    Optional<ForumQuestionVote> findByQuestionIdAndUserId(Long questionId, Long userId);
}
