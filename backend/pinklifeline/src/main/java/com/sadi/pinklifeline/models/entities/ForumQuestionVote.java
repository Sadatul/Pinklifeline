package com.sadi.pinklifeline.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@NoArgsConstructor
@ToString
@Table(name = "forum_question_votes")
public class ForumQuestionVote {
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

    @Column(nullable = false)
    private Integer value;

    public ForumQuestionVote(User user, ForumQuestion question, Integer value) {
        this.user = user;
        this.question = question;
        this.value = value;
    }
}
