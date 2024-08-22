INSERT IGNORE hospitals VALUES (2, 'Gazi Medical College', 'A very nice hospital', 'Sonadanga, Khulna', '01884223311', 'gazi@gmail.com');
INSERT IGNORE hospitals VALUES (3, 'Rashid Medical College', 'A very nice hospital', 'Moylapota, Khulna', '01884223311', 'gazi@gmail.com');

INSERT IGNORE medical_tests VALUES (1, 'ECG', 'very nice thing');
INSERT IGNORE medical_tests VALUES (2, 'CT-Scan', 'very nice thing');

INSERT IGNORE hospital_tests VALUES (1, 2, 1, 1000);
INSERT IGNORE hospital_tests VALUES (2, 2, 2, 1500);
INSERT IGNORE hospital_tests VALUES (3, 3, 1, 1200);
