INSERT INTO users VALUES (10, '10@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Faria Islam');
INSERT INTO pinklifeline.profile_pictures VALUES (10, 'someprofilepicture');
INSERT INTO pinklifeline.user_roles VALUES (10, 'ROLE_PATIENT');
INSERT INTO pinklifeline.basic_users_details VALUES (10, 'Faria Islam', '2000-08-28', '55', '50', 'N', '2024-05-28', 7);
INSERT INTO pinklifeline.patient_specific_details VALUES (10, 'STAGE_0', '2024-05-28', '883cf1760bfffff', true);

INSERT INTO users VALUES (11, 'jakafasdfjsldf@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Kaka Vai');
INSERT INTO pinklifeline.user_roles VALUES (11, 'ROLE_DOCTOR');
INSERT INTO pinklifeline.doctor_details VALUES (11, 'Kaka Vai', 'sdfasdfsdfsdf', 'Dhaka Medical College', 'Cancer', 'Head', '01231435512', 'Y');

INSERT INTO pinklifeline.doctor_consultation_locations VALUES(2, 11, '252/1 Sonadanga, Khulna', '09:00:00', '12:00:00', '0011111', 1000);

INSERT INTO pinklifeline.appointments VALUES(2, 10, 11, '0123123123', '2024-05-28', null, 2, true, true, '2024-07-13 11:03:33', 'ACCEPTED');