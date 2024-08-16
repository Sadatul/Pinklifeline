package com.sadi.pinklifeline.repositories.forum;

import com.sadi.pinklifeline.models.entities.ForumQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumQuestionRepository extends JpaRepository<ForumQuestion, Long>,
        JpaSpecificationExecutor<ForumQuestion> {
}
