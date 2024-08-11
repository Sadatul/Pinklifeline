CREATE TABLE pinklifeline.balance_history
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    user_id       BIGINT                NOT NULL,
    description   VARCHAR(255)          NOT NULL,
    value         INT                   NOT NULL,
    timestamp     datetime              NOT NULL,
    CONSTRAINT pk_balance_history PRIMARY KEY (id)
);


ALTER TABLE pinklifeline.balance_history
    ADD CONSTRAINT FK_BALANCE_HISTORY_ON_USER FOREIGN KEY (user_id) REFERENCES pinklifeline.users (id);
