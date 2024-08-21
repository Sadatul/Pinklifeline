CREATE TABLE hospital_reviews
(
    id          BIGINT AUTO_INCREMENT NOT NULL,
    hospital_id BIGINT                NOT NULL,
    reviewer_id BIGINT                NOT NULL,
    rating      INT                   NOT NULL,
    timestamp   datetime              NOT NULL,
    CONSTRAINT pk_hospital_reviews PRIMARY KEY (id)
);

CREATE TABLE pinklifeline.hospital_reviews_comments
(
    review_id       BIGINT       NOT NULL,
    comment         VARCHAR(255) NOT NULL,
    CONSTRAINT pk_hospital_reviews_comments PRIMARY KEY (review_id)
);


CREATE TABLE hospital_tests
(
    id          BIGINT AUTO_INCREMENT NOT NULL,
    hospital_id BIGINT                NOT NULL,
    test_id     BIGINT                NOT NULL,
    fee         INT                   NOT NULL,
    CONSTRAINT pk_hospital_tests PRIMARY KEY (id)
);

CREATE TABLE hospitals
(
    id             BIGINT AUTO_INCREMENT NOT NULL,
    name           VARCHAR(255)          NOT NULL,
    description    VARCHAR(1000)         NOT NULL,
    location       VARCHAR(255)          NOT NULL,
    contact_number VARCHAR(30)           NOT NULL,
    email          VARCHAR(255)          NOT NULL,
    CONSTRAINT pk_hospitals PRIMARY KEY (id)
);

CREATE TABLE medical_tests
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    name          VARCHAR(255)          NOT NULL,
    description   VARCHAR(1000)         NOT NULL,
    CONSTRAINT pk_medical_tests PRIMARY KEY (id)
);

ALTER TABLE hospital_reviews
    ADD CONSTRAINT FK_HOSPITAL_REVIEWS_ON_HOSPITAL FOREIGN KEY (hospital_id) REFERENCES hospitals (id);

ALTER TABLE hospital_reviews
    ADD CONSTRAINT FK_HOSPITAL_REVIEWS_ON_REVIEWER FOREIGN KEY (reviewer_id) REFERENCES users (id);

ALTER TABLE pinklifeline.hospital_reviews_comments
    ADD CONSTRAINT FK_HOSPITAL_REVIEWS_COMMENTS_ON_REVIEW_ID FOREIGN KEY (review_id) REFERENCES hospital_reviews (id);

ALTER TABLE hospital_tests
    ADD CONSTRAINT FK_HOSPITAL_TESTS_ON_HOSPITAL FOREIGN KEY (hospital_id) REFERENCES hospitals (id) ON DELETE CASCADE;

ALTER TABLE hospital_tests
    ADD CONSTRAINT FK_HOSPITAL_TESTS_ON_TEST FOREIGN KEY (test_id) REFERENCES medical_tests (id) ON DELETE CASCADE;

CREATE INDEX index_hospitals_name ON hospitals (name);

CREATE INDEX index_hospitals_location ON hospitals (location);

CREATE INDEX index_medical_tests_name ON medical_tests (name);
