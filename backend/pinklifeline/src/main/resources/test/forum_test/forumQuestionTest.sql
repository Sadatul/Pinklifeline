INSERT IGNORE INTO users VALUES (17, '17@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Faria Islam');
INSERT IGNORE INTO pinklifeline.profile_pictures VALUES (17, 'someprofilepicture');
INSERT IGNORE INTO pinklifeline.user_roles VALUES (17, 'ROLE_PATIENT');
INSERT IGNORE INTO pinklifeline.basic_users_details VALUES (17, 'Faria Islam', '2000-08-28', '55', '50', 'N', '2024-05-28', 7);
INSERT IGNORE INTO pinklifeline.patient_specific_details VALUES (17, 'STAGE_0', '2024-05-28', '883cf1760bfffff');

INSERT IGNORE INTO users VALUES (18, '18@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Raka Vai');
INSERT IGNORE INTO pinklifeline.user_roles VALUES (18, 'ROLE_DOCTOR');
INSERT IGNORE INTO pinklifeline.doctor_details VALUES (18, 'Raka Vai', 'sdfasdfsdfsdf', 'Khulna Medical College', 'Cancer', 'Consultant', '01231435512', 'Y');

INSERT IGNORE INTO forum_questions VALUES (1, 18, 'How to treat cancer', 'A lot of content going to be done', 0, '2024-05-12 11:03:33');
INSERT INTO forum_tags VALUES (1, 'cancer');
INSERT INTO forum_tags VALUES (1, 'treatment');
INSERT IGNORE INTO forum_questions VALUES (2, 18, 'How to treat cancer with ease', 'A lot of content going to be done', 0, '2024-06-13 11:03:33');
INSERT INTO forum_tags VALUES (2, 'cancer');
INSERT INTO forum_tags VALUES (2, 'treatment');
INSERT IGNORE INTO forum_questions VALUES (3, 18, 'Breast Cancer detection', 'A lot of content going to be done', 1, '2024-07-13 11:03:33');
INSERT IGNORE INTO forum_question_votes VALUES (1, 3, 17, 1);
INSERT INTO forum_tags VALUES (3, 'cancer');
INSERT INTO forum_tags VALUES (3, 'hospital');
INSERT IGNORE INTO forum_questions VALUES (4, 18, 'Preventing Breast Cancer', 'A lot of content going to be done', -1, '2024-08-13 11:03:33');
INSERT IGNORE INTO forum_question_votes VALUES (2, 4, 17, -1);
INSERT INTO forum_tags VALUES (4, 'cancer');