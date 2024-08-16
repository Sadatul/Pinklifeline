CREATE TABLE forum_answer_votes
(
    id              BIGINT AUTO_INCREMENT NOT NULL,
    user_id         BIGINT                NOT NULL,
    forum_answer_id BIGINT                NOT NULL,
    value           INT                   NOT NULL,
    CONSTRAINT pk_forum_answer_votes PRIMARY KEY (id)
);

CREATE TABLE forum_answers
(
    id                BIGINT AUTO_INCREMENT NOT NULL,
    user_id           BIGINT                NOT NULL,
    forum_question_id BIGINT                NOT NULL,
    parent_answer     BIGINT                NULL,
    body              TEXT                  NOT NULL,
    vote_count        INT                   NOT NULL,
    created_at        datetime              NOT NULL,
    CONSTRAINT pk_forum_answers PRIMARY KEY (id)
);

CREATE TABLE forum_question_votes
(
    id                BIGINT AUTO_INCREMENT NOT NULL,
    user_id           BIGINT                NOT NULL,
    forum_question_id BIGINT                NOT NULL,
    value             INT                   NOT NULL,
    CONSTRAINT pk_forum_question_votes PRIMARY KEY (id)
);

CREATE TABLE forum_questions
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    user_id    BIGINT                NOT NULL,
    title      VARCHAR(255)          NOT NULL,
    body       TEXT                  NOT NULL,
    vote_count INT                   NOT NULL,
    created_at datetime              NOT NULL,
    CONSTRAINT pk_forum_questions PRIMARY KEY (id)
);

CREATE TABLE forum_tags
(
    forum_id BIGINT       NOT NULL,
    tag      VARCHAR(255) NOT NULL
);

CREATE INDEX index_forum_answers_created_at ON forum_answers (created_at);

CREATE INDEX index_forum_questions_created_at ON forum_questions (created_at);

CREATE INDEX index_forum_questions_title ON forum_questions (title);

CREATE INDEX index_forum_tags_tag ON forum_tags (tag);

ALTER TABLE forum_answers
    ADD CONSTRAINT FK_FORUM_ANSWERS_ON_FORUM_QUESTION FOREIGN KEY (forum_question_id) REFERENCES forum_questions (id) ON DELETE CASCADE;

ALTER TABLE forum_answers
    ADD CONSTRAINT FK_FORUM_ANSWERS_ON_PARENT_ANSWER FOREIGN KEY (parent_answer) REFERENCES forum_answers (id) ON DELETE CASCADE;

ALTER TABLE forum_answers
    ADD CONSTRAINT FK_FORUM_ANSWERS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE forum_answer_votes
    ADD CONSTRAINT FK_FORUM_ANSWER_VOTES_ON_FORUM_ANSWER FOREIGN KEY (forum_answer_id) REFERENCES forum_answers (id) ON DELETE CASCADE;

ALTER TABLE forum_answer_votes
    ADD CONSTRAINT FK_FORUM_ANSWER_VOTES_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE forum_questions
    ADD CONSTRAINT FK_FORUM_QUESTIONS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE forum_question_votes
    ADD CONSTRAINT FK_FORUM_QUESTION_VOTES_ON_FORUM_QUESTION FOREIGN KEY (forum_question_id) REFERENCES forum_questions (id) ON DELETE CASCADE;

ALTER TABLE forum_question_votes
    ADD CONSTRAINT FK_FORUM_QUESTION_VOTES_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE forum_tags
    ADD CONSTRAINT fk_forum_tags_on_forum_question FOREIGN KEY (forum_id) REFERENCES forum_questions (id);
