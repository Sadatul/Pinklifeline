INSERT IGNORE INTO users VALUES (21, '21@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Faria Islam');
INSERT IGNORE INTO pinklifeline.profile_pictures VALUES (21, 'someprofilepicture');
INSERT IGNORE INTO pinklifeline.user_roles VALUES (21, 'ROLE_PATIENT');
INSERT IGNORE INTO pinklifeline.basic_users_details VALUES (21, 'Faria Islam', '2000-08-28', '55', '50', 'N', '2024-05-28', 7);
INSERT IGNORE INTO pinklifeline.patient_specific_details VALUES (21, 'STAGE_0', '2024-05-28', '883cf1760bfffff', true);

INSERT IGNORE INTO users VALUES (22, 'pinklife22@example.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Raka Vai');
INSERT IGNORE INTO pinklifeline.user_roles VALUES (22, 'ROLE_DOCTOR');
INSERT IGNORE INTO pinklifeline.doctor_details VALUES (22, 'Raka Vai', 'sdfasdfsdfsdf', 'Khulna Medical College', 'Cancer', 'Consultant', '01231435512', 'Y');

INSERT IGNORE INTO blogs VALUES (5, 22, 'How to treat cancer', 'A lot of content going to be done', 0, '2024-05-12 11:03:33');

INSERT IGNORE INTO forum_questions VALUES (6, 22, 'How to treat cancer', 'A lot of content going to be done', 0, '2024-08-12 11:03:33');

INSERT IGNORE INTO forum_answers VALUES (2, 22, 6, null, 'A lot of content going to be done', 0, '2024-07-12 11:30:33');

INSERT IGNORE INTO complaints VALUES (1, 22, 5, 'BLOG', 'violence', 'Very violent content', '2024-05-12 11:03:33');
INSERT IGNORE INTO complaints VALUES (2, 21, 5, 'BLOG', 'Nudity', 'Very offensive content', '2024-06-12 11:03:33');
INSERT IGNORE INTO complaints VALUES (3, 22, 6, 'FORUM_QUESTION', 'violence', 'Very violent content', '2024-07-12 11:03:33');
INSERT IGNORE INTO complaints VALUES (4, 22, 2, 'FORUM_ANSWER', 'Dis-information', 'Wrong Information', '2024-08-12 11:03:33')