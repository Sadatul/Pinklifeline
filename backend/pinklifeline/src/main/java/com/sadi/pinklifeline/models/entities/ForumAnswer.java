package com.sadi.pinklifeline.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@Table(name = "forum_answers", indexes = {
        @Index(name = "index_forum_answers_created_at", columnList = "created_at")
})
public class ForumAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "forum_question_id", nullable = false)
    private ForumQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "parent_answer")
    private ForumAnswer parentAnswer;

    @Column(nullable = false)
    private String body;

    @Column(name = "vote_count", nullable = false)
    private Integer voteCount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public ForumAnswer() {
        voteCount = 0;
        createdAt = LocalDateTime.now();
    }

    public ForumAnswer(User user, ForumQuestion question, ForumAnswer parentAnswer, String body) {
        this.user = user;
        this.question = question;
        this.parentAnswer = parentAnswer;
        this.body = body;
        voteCount = 0;
        createdAt = LocalDateTime.now();
    }
}
