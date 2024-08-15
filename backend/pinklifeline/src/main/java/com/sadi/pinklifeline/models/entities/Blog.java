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
@Table(name = "blogs", indexes = {
        @Index(name = "index_blogs_created_at", columnList = "created_at"),
        @Index(name = "index_blogs_title", columnList = "title")
})
public class Blog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "author_id", nullable = false)
    private DoctorDetails author;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String content;

    @Column(name = "upvote_count", nullable = false)
    private Integer upvoteCount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Blog() {
        upvoteCount = 0;
        createdAt = LocalDateTime.now();
    }

    public Blog(DoctorDetails author, String title, String content) {
        this.author = author;
        this.title = title;
        this.content = content;
        this.upvoteCount = 0;
        this.createdAt = LocalDateTime.now();
    }
}
