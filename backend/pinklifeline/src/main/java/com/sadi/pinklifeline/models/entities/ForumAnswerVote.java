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
@Table(name = "forum_answer_votes")
public class ForumAnswerVote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "forum_answer_id", nullable = false)
    private ForumAnswer question;

    @Column(nullable = false)
    private Integer value;
}
