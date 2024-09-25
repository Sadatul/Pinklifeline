INSERT IGNORE INTO users VALUES (26, 'pinklife26@example.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Raka Vai');
INSERT IGNORE INTO pinklifeline.user_roles VALUES (26, 'ROLE_DOCTOR');
INSERT IGNORE INTO pinklifeline.doctor_details VALUES (26, 'Raka Vai', 'sdfasdfsdfsdf', 'Khulna Medical College', 'Cancer', 'Consultant', '01231435512', 'Y');

INSERT IGNORE INTO users VALUES (27, 'pinklife27@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Faria Islam');
INSERT IGNORE INTO pinklifeline.profile_pictures VALUES (27, 'someprofilepicture');
INSERT IGNORE INTO pinklifeline.user_roles VALUES (27, 'ROLE_PATIENT');
INSERT IGNORE INTO pinklifeline.basic_users_details VALUES (27, 'Faria Islam', '2000-08-28', '55', '50', 'N', '2024-05-28', 7);
INSERT IGNORE INTO pinklifeline.patient_specific_details VALUES (27, 'STAGE_0', '2024-05-28', '883cf1760bfffff', true);

INSERT IGNORE paid_works VALUES (1, 27, 'Taking care of my grandma', 'A lots of details', 'Dhaka, Bangladesh', '2024-08-24', '2024-08-24', 1, 'ACCEPTED');
INSERT IGNORE paid_work_providers VALUES (1, 26);