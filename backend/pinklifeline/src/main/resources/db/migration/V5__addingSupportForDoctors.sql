CREATE TABLE pinklifeline.doctor_details
(
    user_id             BIGINT                      NOT NULL,
    full_name           VARCHAR(255)                NOT NULL,
    registration_number VARCHAR(255)                NOT NULL,
    workplace           VARCHAR(255)                NOT NULL,
    department          VARCHAR(255)                NOT NULL,
    designation         VARCHAR(255)                NOT NULL,
    contact_number      VARCHAR(255)                NOT NULL,
    is_verified         ENUM ('Y', 'N') DEFAULT 'N' NOT NULL,
    CONSTRAINT pk_doctor_details PRIMARY KEY (user_id)
);

CREATE TABLE pinklifeline.doctor_qualifications
(
    user_id       BIGINT       NOT NULL,
    qualification VARCHAR(255) NOT NULL
);

CREATE TABLE pinklifeline.doctor_consultation_locations
(
    id       BIGINT AUTO_INCREMENT NOT NULL,
    user_id  BIGINT                NOT NULL,
    location VARCHAR(255)          NOT NULL,
    start    time                  NOT NULL,
    end      time                  NOT NULL,
    workdays VARCHAR(255)          NOT NULL,
    CONSTRAINT pk_doctor_consultation_locations PRIMARY KEY (id)
);

CREATE TABLE pinklifeline.doctor_reviews
(
    id      BIGINT AUTO_INCREMENT NOT NULL,
    user_id BIGINT                NOT NULL,
    rating  INT                   NOT NULL,
    review  VARCHAR(255)          NULL,
    CONSTRAINT pk_doctor_reviews PRIMARY KEY (id)
);

ALTER TABLE pinklifeline.doctor_details
    ADD CONSTRAINT FK_DOCTOR_DETAILS_ON_USER FOREIGN KEY (user_id) REFERENCES pinklifeline.users (id);

ALTER TABLE pinklifeline.doctor_qualifications
    ADD CONSTRAINT fk_doctor_qualifications_on_doctor_details FOREIGN KEY (user_id) REFERENCES pinklifeline.doctor_details (user_id);

ALTER TABLE pinklifeline.doctor_consultation_locations
    ADD CONSTRAINT FK_DOCTOR_CONSULTATION_LOCATIONS_ON_USER FOREIGN KEY (user_id) REFERENCES pinklifeline.doctor_details (user_id);

ALTER TABLE pinklifeline.doctor_reviews
    ADD CONSTRAINT FK_DOCTOR_REVIEWS_ON_USER FOREIGN KEY (user_id) REFERENCES pinklifeline.doctor_details (user_id);