CREATE TABLE notification_subscriptions
(
    id          BIGINT AUTO_INCREMENT NOT NULL,
    user_id     BIGINT                NOT NULL,
    endpoint    VARCHAR(255)          NOT NULL,
    public_key  VARCHAR(255)          NOT NULL,
    auth        VARCHAR(255)          NOT NULL,
    permissions INT                   NOT NULL,
    CONSTRAINT pk_notification_subscriptions PRIMARY KEY (id)
);

CREATE TABLE scheduled_notifications
(
    id           BIGINT AUTO_INCREMENT NOT NULL,
    user_id      BIGINT                NOT NULL,
    payload      TEXT                  NOT NULL,
    target_date  date                  NOT NULL,
    type         VARCHAR(255)          NOT NULL,
    CONSTRAINT pk_scheduled_notifications PRIMARY KEY (id)
);


ALTER TABLE notification_subscriptions
    ADD CONSTRAINT FK_NOTIFICATION_SUBSCRIPTIONS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE scheduled_notifications
    ADD CONSTRAINT FK_SCHEDULED_NOTIFICATIONS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);