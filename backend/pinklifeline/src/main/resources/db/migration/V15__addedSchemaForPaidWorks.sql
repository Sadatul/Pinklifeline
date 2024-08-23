CREATE TABLE paid_work_tags
(
    work_id BIGINT       NOT NULL,
    tag     VARCHAR(30) NOT NULL
);

CREATE TABLE paid_works
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    user_id       BIGINT                NOT NULL,
    title         VARCHAR(255)          NOT NULL,
    description   VARCHAR(1000)         NOT NULL,
    created_at    datetime              NOT NULL,
    last_updated  datetime              NOT NULL,
    version       BIGINT                NULL,
    status        VARCHAR(50)           NOT NULL,
    CONSTRAINT pk_paid_works PRIMARY KEY (id)
);

CREATE TABLE paid_work_providers
(
    work_id           BIGINT                NOT NULL,
    provider_id       BIGINT                NOT NULL,
    CONSTRAINT pk_paid_works PRIMARY KEY (work_id)
);

CREATE INDEX index_paid_works_created_at ON paid_works (created_at);

CREATE INDEX index_paid_work_tags_tag ON paid_work_tags (tag);

ALTER TABLE paid_work_providers
    ADD CONSTRAINT FK_PAID_WORK_PROVIDERS_ON_PROVIDER FOREIGN KEY (provider_id) REFERENCES doctor_details (user_id);

ALTER TABLE paid_work_providers
    ADD CONSTRAINT FK_PAID_WORK_PROVIDERS_ON_WORK FOREIGN KEY (work_id) REFERENCES paid_works (id);

ALTER TABLE paid_works
    ADD CONSTRAINT FK_PAID_WORKS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE paid_work_tags
    ADD CONSTRAINT fk_paid_work_tags_on_paid_work FOREIGN KEY (work_id) REFERENCES paid_works (id);
