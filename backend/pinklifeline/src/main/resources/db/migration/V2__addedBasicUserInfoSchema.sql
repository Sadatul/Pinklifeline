CREATE TABLE basic_users_details
(
    user_id          BIGINT       NOT NULL,
    full_name        VARCHAR(255) NOT NULL,
    dob              date         NOT NULL,
    weight           DOUBLE       NOT NULL,
    height           DOUBLE       NOT NULL,
    cancer_history   ENUM('Y', 'N')   NOT NULL,
    last_period_date date         NOT NULL,
    avg_cycle_length INT          NOT NULL,
    CONSTRAINT basic_users_details PRIMARY KEY (user_id)
);

CREATE TABLE pinklifeline.profile_pictures
(
    user_id   BIGINT       NOT NULL,
    profile_picture VARCHAR(512) NOT NULL,
    CONSTRAINT pk_profile_pictures PRIMARY KEY (user_id)
);

CREATE TABLE pinklifeline.allergies
(
    user_id     BIGINT       NOT NULL,
    allergy_name VARCHAR(255) NOT NULL
);

CREATE TABLE pinklifeline.cancer_relatives
(
    user_id  BIGINT       NOT NULL,
    relative VARCHAR(255) NOT NULL
);

CREATE TABLE pinklifeline.medications
(
    user_id          BIGINT       NOT NULL,
    name             VARCHAR(255) NOT NULL,
    dose_description VARCHAR(255) NOT NULL
);

CREATE TABLE pinklifeline.organs_with_chronic_condition
(
    user_id BIGINT       NOT NULL,
    organ   VARCHAR(255) NOT NULL
);

CREATE TABLE pinklifeline.period_irregularities
(
    user_id      BIGINT       NOT NULL,
    irregularity VARCHAR(255) NOT NULL
);

ALTER TABLE pinklifeline.basic_users_details
    ADD CONSTRAINT FK_BASIC_USERS_DETAILS_ON_USERID FOREIGN KEY (user_id) REFERENCES pinklifeline.users (id);

ALTER TABLE pinklifeline.profile_pictures
    ADD CONSTRAINT FK_PROFILE_PICTURES_ON_USERID FOREIGN KEY (user_id) REFERENCES pinklifeline.users (id);

ALTER TABLE pinklifeline.allergies
    ADD CONSTRAINT fk_allergies_on_basic_user FOREIGN KEY (user_id) REFERENCES pinklifeline.basic_users_details (user_id);

ALTER TABLE pinklifeline.cancer_relatives
    ADD CONSTRAINT fk_cancer_relatives_on_basic_user FOREIGN KEY (user_id) REFERENCES pinklifeline.basic_users_details (user_id);

ALTER TABLE pinklifeline.medications
    ADD CONSTRAINT fk_medications_on_basic_user FOREIGN KEY (user_id) REFERENCES pinklifeline.basic_users_details (user_id);

ALTER TABLE pinklifeline.organs_with_chronic_condition
    ADD CONSTRAINT fk_organs_with_chronic_condition_on_basic_user FOREIGN KEY (user_id) REFERENCES pinklifeline.basic_users_details (user_id);

ALTER TABLE pinklifeline.period_irregularities
    ADD CONSTRAINT fk_period_irregularities_on_basic_user FOREIGN KEY (user_id) REFERENCES pinklifeline.basic_users_details (user_id);