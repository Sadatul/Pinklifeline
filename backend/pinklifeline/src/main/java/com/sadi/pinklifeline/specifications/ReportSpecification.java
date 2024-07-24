package com.sadi.pinklifeline.specifications;

import com.sadi.pinklifeline.models.entities.Report;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

public class ReportSpecification {

    public static Specification<Report> withDateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, cb) -> {
            if (startDate != null && endDate != null) {
                return cb.between(root.get("date"), startDate, endDate);
            }
            return null;
        };
    }

    public static Specification<Report> withKeywords(List<String> keywords) {
        return (root, query, cb) -> {
            if (keywords != null && !keywords.isEmpty()) {
                List<String> lowercaseKeywords = keywords.stream()
                        .map(String::toLowerCase)
                        .collect(Collectors.toList());

                Subquery<Long> subquery = query.subquery(Long.class);
                Root<Report> subRoot = subquery.correlate(root);
                Join<Report, String> keywordJoin = subRoot.join("keywords");

                subquery.select(cb.countDistinct(keywordJoin))
                        .where(cb.lower(keywordJoin).in(lowercaseKeywords));

                return cb.equal(subquery, (long) keywords.size());
            }
            return null;
        };
    }

    public static Specification<Report> withUserId(Long userId) {
        return (root, query, cb) -> {
            if (userId != null) {
                return cb.equal(root.get("user").get("id"), userId);
            }
            return null;
        };
    }

    public static Specification<Report> withHospitalNameLike(String hospitalName) {
        return (root, query, cb) -> {
            if (hospitalName != null && !hospitalName.isEmpty()) {
                return cb.like(cb.lower(root.get("hospitalName")), "%" + hospitalName.toLowerCase() + "%");
            }
            return null;
        };
    }

    public static Specification<Report> withDoctorNameLike(String doctorName) {
        return (root, query, cb) -> {
            if (doctorName != null && !doctorName.isEmpty()) {
                return cb.like(cb.lower(root.get("doctorName")), "%" + doctorName.toLowerCase() + "%");
            }
            return null;
        };
    }

    public static Specification<Report> sortByTimestamp(Sort.Direction direction) {
        return (root, query, cb) -> {
            query.orderBy(direction == Sort.Direction.ASC ?
                    cb.asc(root.get("timestamp")) :
                    cb.desc(root.get("timestamp")));
            return null; // sorting doesn't affect the where clause
        };
    }
}
