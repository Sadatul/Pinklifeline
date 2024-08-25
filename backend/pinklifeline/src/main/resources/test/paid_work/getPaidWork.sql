INSERT IGNORE INTO users VALUES (28, 'pinklife28@example.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Raka Vai');
INSERT IGNORE INTO pinklifeline.user_roles VALUES (28, 'ROLE_DOCTOR');
INSERT IGNORE INTO pinklifeline.doctor_details VALUES (28, 'Raka Vai', 'sdfasdfsdfsdf', 'Khulna Medical College', 'Cancer', 'Consultant', '01231435512', 'Y');

INSERT IGNORE INTO users VALUES (29, 'pinklife29@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Faria Islam');
INSERT IGNORE INTO pinklifeline.profile_pictures VALUES (29, 'someprofilepicture');
INSERT IGNORE INTO pinklifeline.user_roles VALUES (29, 'ROLE_PATIENT');
INSERT IGNORE INTO pinklifeline.basic_users_details VALUES (29, 'Faria Islam', '2000-08-28', '55', '50', 'N', '2024-05-28', 7);
INSERT IGNORE INTO pinklifeline.patient_specific_details VALUES (29, 'STAGE_0', '2024-05-28', '883cf1760bfffff', true);

INSERT IGNORE paid_works VALUES (2, 29, 'Taking care of my grandma', 'A lots of details', 'Dhaka, Bangladesh', '2024-08-24', '2024-08-24', 1, 'ACCEPTED');
INSERT IGNORE paid_work_providers VALUES (2, 28);

INSERT IGNORE paid_works VALUES (3, 29, 'Taking care of my grandma', 'A lots of details', 'Dhaka, Bangladesh', '2024-07-24', '2024-08-24', 0, 'POSTED');
INSERT IGNORE paid_work_tags VALUES (3, 'NURSING');
INSERT IGNORE paid_work_tags VALUES (3, 'DOCTOR');

INSERT IGNORE paid_works VALUES (4, 29, 'Taking care of my grandma', 'A lots of details', 'Dhaka, Bangladesh', '2024-06-24', '2024-08-24', 0, 'POSTED');
INSERT IGNORE paid_work_tags VALUES (4, 'NURSING');

INSERT IGNORE paid_works VALUES (5, 29, 'Taking care of my grandma', 'A lots of details', 'Chittagong, Bangladesh', '2024-05-24', '2024-08-24', 0, 'POSTED');
INSERT IGNORE paid_work_tags VALUES (5, 'DOCTOR');

INSERT IGNORE paid_works VALUES (6, 29, 'Taking care of my grandma', 'A lots of details', 'Chittagong, Bangladesh', '2024-04-24', '2024-08-24', 0, 'POSTED');