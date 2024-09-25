CREATE TABLE complaints
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    user_id       BIGINT                NOT NULL,
    resource_id   BIGINT                NOT NULL,
    type          VARCHAR(30)           NOT NULL,
    category      VARCHAR(100)          NOT NULL,
    description   VARCHAR(300)          NOT NULL,
    created_at    datetime              NOT NULL,
    CONSTRAINT pk_complaints PRIMARY KEY (id)
);

CREATE INDEX index_complaints_created_at ON complaints (created_at);

ALTER TABLE complaints
    ADD CONSTRAINT FK_COMPLAINTS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);
