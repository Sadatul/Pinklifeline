INSERT IGNORE INTO users VALUES (15, '15@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Faria Islam');
INSERT IGNORE INTO pinklifeline.profile_pictures VALUES (15, 'someprofilepicture');
INSERT IGNORE INTO pinklifeline.user_roles VALUES (15, 'ROLE_PATIENT');
INSERT IGNORE INTO pinklifeline.basic_users_details VALUES (15, 'Faria Islam', '2000-08-28', '55', '50', 'N', '2024-05-28', 7);
INSERT IGNORE INTO pinklifeline.patient_specific_details VALUES (15, 'STAGE_0', '2024-05-28', '883cf1760bfffff');

INSERT IGNORE INTO users VALUES (16, '16@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Raka Vai');
INSERT IGNORE INTO pinklifeline.user_roles VALUES (16, 'ROLE_DOCTOR');
INSERT IGNORE INTO pinklifeline.doctor_details VALUES (16, 'Raka Vai', 'sdfasdfsdfsdf', 'Khulna Medical College', 'Cancer', 'Consultant', '01231435512', 'Y');

INSERT IGNORE INTO blogs VALUES (1, 16, 'How to treat cancer', 'A lot of content going to be done', 0, '2024-05-12 11:03:33');
INSERT IGNORE INTO blogs VALUES (2, 16, 'How to treat cancer with ease', 'A lot of content going to be done', 0, '2024-06-13 11:03:33');

INSERT IGNORE INTO blogs VALUES (3, 16, 'Breast Cancer detection', 'A lot of content going to be done', 1, '2024-07-13 11:03:33');
INSERT IGNORE INTO blog_votes VALUES (1, 3, 15);

INSERT IGNORE INTO blogs VALUES (4, 16, 'Preventing Breast Cancer', 'A lot of content going to be done', 1, '2024-08-13 11:03:33');
INSERT IGNORE INTO blog_votes VALUES (2, 4, 15);