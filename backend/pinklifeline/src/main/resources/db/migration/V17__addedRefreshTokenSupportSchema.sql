CREATE TABLE refresh_tokens
(
    user_id     BIGINT       NOT NULL,
    token       VARCHAR(255) NOT NULL,
    expiry_date datetime     NOT NULL,
    CONSTRAINT pk_refresh_tokens PRIMARY KEY (user_id)
);

ALTER TABLE refresh_tokens
    ADD CONSTRAINT uc_refresh_tokens_token UNIQUE (token);

ALTER TABLE refresh_tokens
    ADD CONSTRAINT FK_REFRESH_TOKENS_ON_USER_ID FOREIGN KEY (user_id) REFERENCES users (id);