CREATE TABLE pinklifeline.user_roles
(
    user_id BIGINT       NOT NULL,
    roles   VARCHAR(255) NOT NULL
);

CREATE TABLE pinklifeline.users
(
    id       BIGINT AUTO_INCREMENT NOT NULL,
    username VARCHAR(255)          NOT NULL,
    password VARCHAR(255)          NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id)
);

ALTER TABLE pinklifeline.users
    ADD CONSTRAINT uc_users_username UNIQUE (username);

ALTER TABLE pinklifeline.user_roles
    ADD CONSTRAINT fk_user_roles_on_user FOREIGN KEY (user_id) REFERENCES pinklifeline.users (id);