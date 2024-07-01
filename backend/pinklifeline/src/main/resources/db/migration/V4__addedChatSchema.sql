CREATE TABLE chat_message
(
    id        BIGINT AUTO_INCREMENT NOT NULL,
    room_id   BIGINT                NOT NULL,
    message   VARCHAR(255)          NOT NULL,
    sender_id BIGINT                NOT NULL,
    sent_at   datetime              NOT NULL,
    type      ENUM('TEXT')          NOT NULL,
    CONSTRAINT pk_chat_message PRIMARY KEY (id)
);

CREATE TABLE chat_rooms
(
    id       BIGINT AUTO_INCREMENT NOT NULL,
    user1_id BIGINT                NOT NULL,
    user2_id BIGINT                NOT NULL,
    CONSTRAINT pk_chat_rooms PRIMARY KEY (id)
);


ALTER TABLE chat_message
    ADD CONSTRAINT FK_CHAT_MESSAGE_ON_ROOM FOREIGN KEY (room_id) REFERENCES chat_rooms (id);

ALTER TABLE chat_message
    ADD CONSTRAINT FK_CHAT_MESSAGE_ON_SENDER FOREIGN KEY (sender_id) REFERENCES pinklifeline.users (id);

ALTER TABLE chat_rooms
    ADD CONSTRAINT FK_CHAT_ROOMS_ON_USER1 FOREIGN KEY (user1_id) REFERENCES pinklifeline.users (id);

ALTER TABLE chat_rooms
    ADD CONSTRAINT FK_CHAT_ROOMS_ON_USER2 FOREIGN KEY (user2_id) REFERENCES pinklifeline.users (id);