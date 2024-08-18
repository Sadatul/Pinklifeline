package com.sadi.pinklifeline.models.responses;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ForumAnswerRes {
    private Long id;
    private String body;
    private Long parentId;
    private Integer voteByUser;
    private String author;
    private Long authorId;
    private String authorProfilePicture;
    private Integer voteCount;
    private LocalDateTime createdAt;
    private Long numberOfReplies;

    public ForumAnswerRes(Long id, String body, Long parentId, Integer voteByUser,
                          String author, Long authorId, String authorProfilePicture,
                          Integer voteCount, LocalDateTime createdAt, Long numberOfReplies) {
        this.id = id;
        this.body = body;
        this.parentId = parentId;
        this.voteByUser = voteByUser;
        this.author = author;
        this.authorId = authorId;
        this.authorProfilePicture = authorProfilePicture;
        this.voteCount = voteCount;
        this.createdAt = createdAt;
        this.numberOfReplies = numberOfReplies;
    }
}
