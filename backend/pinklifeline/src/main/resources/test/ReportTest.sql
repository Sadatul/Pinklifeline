INSERT INTO users VALUES (12, '12@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Faria Islam');
INSERT INTO pinklifeline.profile_pictures VALUES (12, 'someprofilepicture');
INSERT INTO pinklifeline.user_roles VALUES (12, 'ROLE_PATIENT');
INSERT INTO pinklifeline.basic_users_details VALUES (12, 'Faria Islam', '2000-08-28', '55', '50', 'N', '2024-05-28', 7);
INSERT INTO pinklifeline.patient_specific_details VALUES (12, 'STAGE_0', '2024-05-28', '883cf1760bfffff', true);

INSERT INTO users VALUES (13, '13@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'ROLE_PATIENT');
INSERT INTO pinklifeline.profile_pictures VALUES (13, 'someprofilepicture');
INSERT INTO pinklifeline.user_roles VALUES (13, 'ROLE_PATIENT');
INSERT INTO pinklifeline.basic_users_details VALUES (13, 'Faria Islam', '2000-08-28', '55', '50', 'N', '2024-05-28', 7);
INSERT INTO pinklifeline.patient_specific_details VALUES (13, 'STAGE_0', '2024-05-28', '883cf1760bfffff', true);

INSERT INTO users VALUES (14, '14@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Raka Vai');
INSERT INTO pinklifeline.user_roles VALUES (14, 'ROLE_DOCTOR');
INSERT INTO pinklifeline.doctor_details VALUES (14, 'Raka Vai', 'sdfasdfsdfsdf', 'Khulna Medical College', 'Cancer', 'Consultant', '01231435512', 'Y');

INSERT INTO pinklifeline.reports VALUES (1, 12, 'Dr. Alex', 'Popular Hospital', '2024-01-28', '2024-07-13 11:03:33', 'Dad dad dad', 'google.com');
INSERT INTO pinklifeline.report_keywords VALUES (1, 'Heart');
INSERT INTO pinklifeline.report_keywords VALUES (1, 'Kidney');
INSERT INTO pinklifeline.report_keywords VALUES (1, 'Paracetamol');

INSERT INTO pinklifeline.reports VALUES (2, 12, 'Dr. Bich', 'Special Hospital', '2024-06-28', '2024-07-13 11:33:33', 'Dad dad dad', 'google.com');
INSERT INTO pinklifeline.report_keywords VALUES (2, 'Heart');
INSERT INTO pinklifeline.report_keywords VALUES (2, 'Kidney');

INSERT INTO pinklifeline.reports VALUES (3, 13, 'Dr. Norton', 'Popular Hospital', '2023-06-28', '2024-07-13 11:56:33', 'Dad dad dad', 'google.com');
INSERT INTO pinklifeline.report_keywords VALUES (3, 'Heart');
INSERT INTO pinklifeline.report_keywords VALUES (3, 'Liver');
INSERT INTO pinklifeline.report_keywords VALUES (3, 'Max');

INSERT INTO pinklifeline.reports VALUES (4, 12, 'Dr. Brice', 'Popular Hospital', '2024-11-28', '2024-07-13 11:33:33', 'Dad dad dad', 'google.com');
INSERT INTO pinklifeline.report_keywords VALUES (4, 'Liver');
INSERT INTO pinklifeline.report_keywords VALUES (4, 'Kidney');