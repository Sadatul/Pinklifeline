INSERT IGNORE INTO users VALUES (19, '19@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Faria Islam');
INSERT IGNORE INTO pinklifeline.profile_pictures VALUES (19, 'someprofilepicture');
INSERT IGNORE INTO pinklifeline.user_roles VALUES (19, 'ROLE_PATIENT');
INSERT IGNORE INTO pinklifeline.basic_users_details VALUES (19, 'Faria Islam', '2000-08-28', '55', '50', 'N', '2024-05-28', 7);
INSERT IGNORE INTO pinklifeline.patient_specific_details VALUES (19, 'STAGE_0', '2024-05-28', '883cf1760bfffff', true);

INSERT IGNORE INTO users VALUES (20, '20@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Raka Vai');
INSERT IGNORE INTO pinklifeline.user_roles VALUES (20, 'ROLE_DOCTOR');
INSERT IGNORE INTO pinklifeline.doctor_details VALUES (20, 'Raka Vai', 'sdfasdfsdfsdf', 'Khulna Medical College', 'Cancer', 'Consultant', '01231435512', 'Y');

INSERT IGNORE INTO forum_questions VALUES (5, 20, 'How to treat cancer', 'A lot of content going to be done', 0, '2024-05-12 11:03:33');
INSERT INTO forum_tags VALUES (5, 'cancer');
INSERT INTO forum_tags VALUES (5, 'treatment');

INSERT IGNORE INTO forum_answers VALUES (1, 19, 5, null, 'A lot of content going to be done', 0, '2024-05-12 11:30:33');

