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
public class BlogsRes {
    private Long id;
    private String title;
    private String content;
    private Long voteId;
    private String author;
    private Long authorId;
    private String authorProfilePicture;
    private Integer upvoteCount;
    private LocalDateTime createdAt;

    public BlogsRes(Long id, String title, String content, Long voteId,
                    String author, Long authorId, String authorProfilePicture,
                    Integer upvoteCount, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.voteId = voteId;
        this.author = author;
        this.authorId = authorId;
        this.authorProfilePicture = authorProfilePicture;
        this.upvoteCount = upvoteCount;
        this.createdAt = createdAt;
    }

    public BlogsRes(Long id, String title, String content,
                    String author, Long authorId, String authorProfilePicture,
                    Integer upvoteCount, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.author = author;
        this.authorId = authorId;
        this.authorProfilePicture = authorProfilePicture;
        this.upvoteCount = upvoteCount;
        this.createdAt = createdAt;
    }
}
