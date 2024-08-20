INSERT INTO users VALUES (2, 'jakafasdfjsldf@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Sadatul Islam');
INSERT INTO pinklifeline.user_roles VALUES (2, 'ROLE_PATIENT');
INSERT INTO pinklifeline.basic_users_details VALUES (2, 'Sadatul Islam', '2000-08-28', '55', '50', 'N', '2024-05-28', 7);
INSERT INTO pinklifeline.patient_specific_details VALUES (2, 'SURVIVOR', '2024-05-28', '883cf1760bfffff', true);

INSERT INTO users VALUES (3, 'jakafasfjsldf@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Faria Islam');
INSERT INTO pinklifeline.profile_pictures VALUES (3, 'someprofilepicture');
INSERT INTO pinklifeline.user_roles VALUES (3, 'ROLE_PATIENT');
INSERT INTO pinklifeline.basic_users_details VALUES (3, 'Faria Islam', '2000-08-28', '55', '50', 'N', '2024-05-28', 7);
INSERT INTO pinklifeline.patient_specific_details VALUES (3, 'STAGE_0', '2024-05-28', '883cf1760bfffff', true);

INSERT IGNORE INTO users VALUES (4, 'jakaasdfjsldf@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Dimtri Islam');
INSERT IGNORE INTO pinklifeline.user_roles VALUES (4, 'ROLE_PATIENT');
INSERT IGNORE INTO pinklifeline.basic_users_details VALUES (4, 'Dimtri Islam', '2000-08-28', '55', '50', 'N', '2024-05-28', 7);
INSERT IGNORE INTO pinklifeline.patient_specific_details VALUES (4, 'SURVIVOR', '2024-05-28', '883cf17603fffff', true);

INSERT INTO users VALUES (5, 'jakaasdfjsldsdff@gmail.com', 'dsjflasjdfljlsdfjldsf', 'Y', 'Darek Islam');
INSERT INTO pinklifeline.user_roles VALUES (5, 'ROLE_PATIENT');
INSERT INTO pinklifeline.basic_users_details VALUES (5, 'Darek Islam', '2000-08-28', '55', '50', 'N', '2024-05-28', 7);
INSERT INTO pinklifeline.patient_specific_details VALUES (5, 'SURVIVOR', '2024-05-28', '88032665e5fffff', true);

INSERT INTO chat_rooms VALUES (1, 2, 3);
INSERT INTO chat_message VALUES (1, 1, 'Call ADIL', 2, '2024-03-28 22:45:33', 'TEXT');
INSERT INTO chat_rooms VALUES (2, 2, 4);
INSERT INTO chat_message VALUES (2, 2, 'Call ADIL', 2, '2024-03-28 22:46:33', 'TEXT');
INSERT INTO chat_rooms VALUES (3, 5, 2);
INSERT INTO chat_message VALUES (3, 3, 'Call ADIL', 5, '2024-03-28 22:42:33', 'TEXT');
INSERT INTO chat_rooms VALUES (4, 3, 5);
INSERT INTO chat_message VALUES (4, 4, 'Call ADIL', 5, '2024-03-28 22:42:33', 'TEXT');