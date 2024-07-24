package com.sadi.pinklifeline.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
@Entity
@Table(name = "reports", indexes = @Index(name = "index_reports_date", columnList = "date"))
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "doctor_name", nullable = false)
    private String doctorName;

    @Column(name = "hospital_name", nullable = false)
    private String hospitalName;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String summary;

    @Column(name = "file_link", nullable = false)
    private String fileLink;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "report_keywords",joinColumns = @JoinColumn(name = "report_id"),
            indexes = @Index(name = "index_report_keywords_keyword", columnList = "keyword"))
    @Column(name = "keyword", nullable = false)
    private List<String> keywords;

    public Report() {
    }

    public Report(User user, String doctorName, String hospitalName,
                  LocalDate date, String summary, String fileLink, List<String> keywords) {
        this.user = user;
        this.doctorName = doctorName;
        this.hospitalName = hospitalName;
        this.date = date;
        this.summary = summary;
        this.fileLink = fileLink;
        this.keywords = keywords;
        this.timestamp = LocalDateTime.now();
    }
}
