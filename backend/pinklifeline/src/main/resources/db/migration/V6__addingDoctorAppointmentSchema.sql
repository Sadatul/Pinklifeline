CREATE TABLE pinklifeline.appointments
(
    id                     BIGINT AUTO_INCREMENT NOT NULL,
    patient_id             BIGINT                NOT NULL,
    doctor_id              BIGINT                NOT NULL,
    patient_contact_number VARCHAR(20)           NOT NULL,
    date                   date                  NOT NULL,
    time                   time                  NULL,
    location_id            BIGINT                NOT NULL,
    is_online              BIT(1)                NOT NULL,
    is_payment_complete    BIT(1)                NOT NULL,
    timestamp              datetime              NOT NULL,
    status                 VARCHAR(30)           NOT NULL,
    CONSTRAINT pk_appointments PRIMARY KEY (id)
);

ALTER TABLE pinklifeline.appointments
    ADD CONSTRAINT FK_APPOINTMENTS_ON_DOCTOR FOREIGN KEY (doctor_id) REFERENCES pinklifeline.doctor_details (user_id);

ALTER TABLE pinklifeline.appointments
    ADD CONSTRAINT FK_APPOINTMENTS_ON_LOCATION FOREIGN KEY (location_id) REFERENCES pinklifeline.doctor_consultation_locations (id);

ALTER TABLE pinklifeline.appointments
    ADD CONSTRAINT FK_APPOINTMENTS_ON_PATIENT FOREIGN KEY (patient_id) REFERENCES pinklifeline.users (id);