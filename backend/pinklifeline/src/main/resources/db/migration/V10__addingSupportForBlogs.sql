CREATE TABLE blogs
(
    id           BIGINT AUTO_INCREMENT NOT NULL,
    author_id    BIGINT                NOT NULL,
    title        VARCHAR(255)          NOT NULL,
    content      TEXT                  NOT NULL,
    upvote_count INT                   NOT NULL,
    created_at   datetime              NOT NULL,
    CONSTRAINT pk_blogs PRIMARY KEY (id)
);

CREATE TABLE blog_votes
(
    id      BIGINT AUTO_INCREMENT NOT NULL,
    blog_id BIGINT                NOT NULL,
    user_id BIGINT                NOT NULL,
    CONSTRAINT pk_blog_votes PRIMARY KEY (id)
);

ALTER TABLE blogs
    ADD CONSTRAINT FK_BLOGS_ON_AUTHOR FOREIGN KEY (author_id) REFERENCES doctor_details (user_id);

ALTER TABLE blog_votes
    ADD CONSTRAINT FK_BLOG_VOTES_ON_BLOG FOREIGN KEY (blog_id) REFERENCES blogs (id) ON DELETE CASCADE;

ALTER TABLE blog_votes
    ADD CONSTRAINT FK_BLOG_VOTES_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

CREATE INDEX index_blogs_created_at ON blogs (created_at);

CREATE INDEX index_blogs_title ON blogs (title);