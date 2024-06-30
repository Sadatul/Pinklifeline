CREATE TABLE patient_specific_details
(
    user_id        BIGINT                                                                   NOT NULL,
    cancer_stage   ENUM ('STAGE_0', 'STAGE_1', 'STAGE_2', 'STAGE_3', 'STAGE_4', 'SURVIVOR') NOT NULL,
    diagnosis_date date                                                                     NOT NULL,
    location       VARCHAR(255)                                                             NOT NULL,
    CONSTRAINT pk_patient_specific_details PRIMARY KEY (user_id)
);

ALTER TABLE pinklifeline.patient_specific_details
    ADD CONSTRAINT FK_PATIENT_SPECIFIC_DETAILS_ON_USER FOREIGN KEY (user_id) REFERENCES pinklifeline.users (id);