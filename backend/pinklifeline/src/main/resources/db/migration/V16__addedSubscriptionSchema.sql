CREATE TABLE subscriptions
(
    user_id           BIGINT       NOT NULL,
    subscription_type VARCHAR(255) NOT NULL,
    expiry_date       datetime     NULL,
    used_free_trial   BIT(1)       NOT NULL,
    CONSTRAINT pk_subscriptions PRIMARY KEY (user_id)
);

ALTER TABLE subscriptions
    ADD CONSTRAINT FK_SUBSCRIPTIONS_ON_USER_ID FOREIGN KEY (user_id) REFERENCES users (id);