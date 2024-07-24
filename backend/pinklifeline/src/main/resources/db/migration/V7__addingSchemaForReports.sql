CREATE TABLE pinklifeline.report_keywords
(
    report_id BIGINT       NOT NULL,
    keyword   VARCHAR(255) NOT NULL
);

CREATE TABLE pinklifeline.reports
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    user_id       BIGINT                NOT NULL,
    doctor_name   VARCHAR(255)          NOT NULL,
    hospital_name VARCHAR(255)          NOT NULL,
    date          date                  NOT NULL,
    timestamp     datetime              NOT NULL,
    summary       VARCHAR(1000)          NOT NULL,
    file_link     VARCHAR(255)          NOT NULL,
    CONSTRAINT pk_reports PRIMARY KEY (id)
);


ALTER TABLE pinklifeline.reports
    ADD CONSTRAINT FK_REPORTS_ON_USER FOREIGN KEY (user_id) REFERENCES pinklifeline.users (id);

ALTER TABLE pinklifeline.report_keywords
    ADD CONSTRAINT fk_report_keywords_on_report FOREIGN KEY (report_id) REFERENCES pinklifeline.reports (id);

CREATE INDEX index_report_keywords_keyword ON report_keywords (keyword);
CREATE INDEX index_reports_date ON pinklifeline.reports (date);