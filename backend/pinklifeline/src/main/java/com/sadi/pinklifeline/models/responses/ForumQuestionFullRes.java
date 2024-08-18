package com.sadi.pinklifeline.models.responses;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ForumQuestionFullRes {
    private Long id;
    private String title;
    private String body;
    private Integer voteByUser;
    private String author;
    private Long authorId;
    private String authorProfilePicture;
    private Integer voteCount;
    private LocalDateTime createdAt;
    private List<String> tags;

    public ForumQuestionFullRes(Long id, String title, Integer voteByUser, String body,
                                String author, Long authorId, String authorProfilePicture,
                                Integer voteCount, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.voteByUser = voteByUser;
        this.body = body;
        this.author = author;
        this.authorId = authorId;
        this.authorProfilePicture = authorProfilePicture;
        this.voteCount = voteCount;
        this.createdAt = createdAt;
    }
}
