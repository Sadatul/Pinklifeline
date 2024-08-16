package com.sadi.pinklifeline.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@ToString
@Table(name = "forum_questions", indexes = {
        @Index(name = "index_forum_questions_created_at", columnList = "created_at"),
        @Index(name = "index_forum_questions_title", columnList = "title")
})
public class ForumQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String body;

    @Column(name = "vote_count", nullable = false)
    private Integer voteCount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "forum_tags",joinColumns = @JoinColumn(name = "forum_id"),
            indexes = @Index(name = "index_forum_tags_tag", columnList = "tag"))
    @Column(name = "tag", nullable = false)
    private List<String> tags;
}
