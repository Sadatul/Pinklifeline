package com.sadi.pinklifeline.repositories.forum;

import com.sadi.pinklifeline.models.entities.ForumQuestion;
import com.sadi.pinklifeline.models.responses.ForumQuestionFullRes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ForumQuestionRepository extends JpaRepository<ForumQuestion, Long>,
        JpaSpecificationExecutor<ForumQuestion> {

    @Query("select new com.sadi.pinklifeline.models.responses.ForumQuestionFullRes(fq.id, fq.title, (select fqv.value from ForumQuestionVote fqv where fqv.question.id = :id and fqv.user.id = :userId), fq.body, fq.user.fullName, fq.user.id, fq.user.profilePicture, fq.voteCount, fq.createdAt) from ForumQuestion fq where fq.id = :id")
    Optional<ForumQuestionFullRes> getForumQuestionFullResById(Long id, Long userId);

    @Query("select fq.tags from ForumQuestion fq where fq.id = :id")
    List<String> getTagsById(Long id);
}
