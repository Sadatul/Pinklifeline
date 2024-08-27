package com.sadi.pinklifeline.repositories.forum;

import com.sadi.pinklifeline.models.entities.ForumAnswer;
import com.sadi.pinklifeline.models.responses.ForumAnswerRes;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ForumAnswerRepository extends JpaRepository<ForumAnswer, Long> {
    @Query("select new com.sadi.pinklifeline.models.responses.ForumAnswerRes(fa.id, fa.body, fa.parentAnswer.id, fa.question.id,(select fav.value from ForumAnswerVote fav where fav.answer.id = fa.id and fav.user.id = :userId), fa.user.fullName, fa.user.id, fa.user.profilePicture, fa.voteCount, fa.createdAt, (select count(fa2.id) from ForumAnswer fa2 where fa2.parentAnswer.id = fa.id)) from ForumAnswer fa where fa.question.id = :questionId and ((:parentId is null and fa.parentAnswer.id is null) or (fa.parentAnswer.id = :parentId))")
    List<ForumAnswerRes> findByQuestionId(Long questionId, Long userId, Long parentId, Sort sort);

    @Query("select fa.id, fa.user.fullName, fa.user.username, fa.question.title  from ForumAnswer fa where fa.id = :id")
    Optional<Object[]> getForumAnswerWithAuthorData(Long id);

    @Query("select new com.sadi.pinklifeline.models.responses.ForumAnswerRes(fa.id, fa.body, fa.parentAnswer.id, fa.question.id, (select fav.value from ForumAnswerVote fav where fav.answer.id = fa.id and fav.user.id = :userId), fa.user.fullName, fa.user.id, fa.user.profilePicture, fa.voteCount, fa.createdAt, (select count(fa2.id) from ForumAnswer fa2 where fa2.parentAnswer.id = fa.id)) from ForumAnswer fa where fa.id = :id")
    Optional<ForumAnswerRes> findForumAnswerResById(Long id, Long userId);
}
