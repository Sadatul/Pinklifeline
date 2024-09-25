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
public class BlogFullRes {
    private Long id;
    private String title;
    private String content;
    private Long voteId;
    private Long authorId;
    private String authorName;
    private String authorProfilePicture;
    private String authorDepartment;
    private String authorWorkplace;
    private String authorDesignation;
    private List<String> authorQualifications;
    private Integer upvoteCount;
    private LocalDateTime createdAt;

    public BlogFullRes(Long id, String title, String content, Long voteId, Long authorId, String authorName,
                       String authorProfilePicture, String authorDepartment, String authorWorkplace,
                       String authorDesignation, Integer upvoteCount, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.voteId = voteId;
        this.authorId = authorId;
        this.authorName = authorName;
        this.authorProfilePicture = authorProfilePicture;
        this.authorDepartment = authorDepartment;
        this.authorWorkplace = authorWorkplace;
        this.authorDesignation = authorDesignation;
        this.upvoteCount = upvoteCount;
        this.createdAt = createdAt;
    }
}
