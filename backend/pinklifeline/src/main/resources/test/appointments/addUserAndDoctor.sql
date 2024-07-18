INSERT INTO users VALUES (3, 'jakafasfjsldf@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y');
INSERT INTO pinklifeline.profile_pictures VALUES (3, 'someprofilepicture');
INSERT INTO pinklifeline.user_roles VALUES (3, 'ROLE_PATIENT');
INSERT INTO pinklifeline.basic_users_details VALUES (3, 'Faria Islam', '2000-08-28', '55', '50', 'N', '2024-05-28', 7);
INSERT INTO pinklifeline.patient_specific_details VALUES (3, 'STAGE_0', '2024-05-28', '883cf1760bfffff');

INSERT INTO users VALUES (2, 'jakafasdfjsldf@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y');
INSERT INTO pinklifeline.user_roles VALUES (2, 'ROLE_DOCTOR');
INSERT INTO pinklifeline.doctor_details VALUES (2, 'Kaka Vai', 'sdfasdfsdfsdf', 'Dhaka Medical College', 'Cancer', 'Head', '01231435512', 'Y');

INSERT INTO pinklifeline.doctor_consultation_locations VALUES(1, 2, '252/1 Sonadanga, Khulna', '09:00:00', '12:00:00', '0011111', 1000);

INSERT INTO pinklifeline.appointments VALUES(1, 3, 2, '0123123123', '2024-05-28', null, 1, false, false, '2024-07-13 11:03:33', 'REQUESTED');