package com.sadi.pinklifeline.specifications;

import com.sadi.pinklifeline.models.entities.Report;
import com.sadi.pinklifeline.models.entities.SharedReport;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class SharedReportSpecification {
    public static Specification<SharedReport> withUserId(Long userId) {
        return (root, query, cb) -> {
            if (userId != null) {
                return cb.equal(root.get("report").get("user").get("id"), userId);
            }
            return null;
        };
    }

    public static Specification<SharedReport> withDoctorUserId(Long doctorId) {
        return (root, query, cb) -> {
            if (doctorId != null) {
                return cb.equal(root.get("doctor").get("userId"), doctorId);
            }
            return null;
        };
    }

    public static Specification<SharedReport> withExpirationTime() {
        return (root, query, cb) ->
                cb.greaterThan(root.get("expirationTime"), LocalDateTime.now());
    }

    public static Specification<SharedReport> withExpirationTimeNull() {
        return (root, query, cb) ->
                cb.isNull(root.get("expirationTime"));
    }

    public static Specification<SharedReport> withDateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, cb) -> {
            if (startDate != null && endDate != null) {
                return cb.between(root.get("report").get("date"), startDate, endDate);
            }
            return null;
        };
    }

    public static Specification<SharedReport> withKeywords(List<String> keywords) {
        return (root, query, cb) -> {
            if (keywords == null || keywords.isEmpty()) {
                return null;
            }

            List<String> lowerCaseKeywords = keywords.stream()
                    .map(String::toLowerCase)
                    .collect(Collectors.toList());

            Join<SharedReport, Report> reportJoin = root.join("report", JoinType.LEFT);

            Subquery<Long> subquery = query.subquery(Long.class);
            Root<Report> subRoot = subquery.from(Report.class);
            Join<Report, String> keywordJoin = subRoot.join("keywords");

            subquery.select(cb.countDistinct(keywordJoin))
                    .where(cb.and(
                            cb.lower(keywordJoin).in(lowerCaseKeywords),
                            cb.equal(subRoot, reportJoin)
                    )
                    );

            return cb.equal(subquery, (long) keywords.size());
        };
    }

    public static Specification<SharedReport> withHospitalNameLike(String hospitalName) {
        return (root, query, cb) -> {
            if (hospitalName != null && !hospitalName.isEmpty()) {
                return cb.like(cb.lower(root.get("report").get("hospitalName")), "%" + hospitalName.toLowerCase() + "%");
            }
            return null;
        };
    }

    public static Specification<SharedReport> withDoctorNameLike(String doctorName) {
        return (root, query, cb) -> {
            if (doctorName != null && !doctorName.isEmpty()) {
                return cb.like(cb.lower(root.get("report").get("doctorName")), "%" + doctorName.toLowerCase() + "%");
            }
            return null;
        };
    }

    public static Specification<SharedReport> withUsername(String username) {
        return (root, query, cb) -> {
            if (username != null && !username.isEmpty()) {
                return cb.like(cb.lower(root.get("report").get("user").get("username")), "%" + username.toLowerCase() + "%");
            }
            return null;
        };
    }

    public static Specification<SharedReport> withDoctorUsername(String username) {
        return (root, query, cb) -> {
            if (username != null && !username.isEmpty()) {
                return cb.like(cb.lower(root.get("doctor").get("user").get("username")), "%" + username.toLowerCase() + "%");
            }
            return null;
        };
    }
}
