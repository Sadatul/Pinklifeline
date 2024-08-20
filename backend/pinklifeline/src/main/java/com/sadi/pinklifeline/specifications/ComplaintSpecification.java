package com.sadi.pinklifeline.specifications;

import com.sadi.pinklifeline.models.entities.Complaint;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class ComplaintSpecification {
    public static Specification<Complaint> withCategory(String category) {
        return (root, query, cb) -> {
            if (category != null && !category.isEmpty()) {
                return cb.like(cb.lower(root.get("category")), "%" + category.toLowerCase() + "%");
            }
            return null;
        };
    }

    public static Specification<Complaint> withDateBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (startDate != null && endDate != null) {
                return cb.between(root.get("createdAt"), startDate, endDate);
            }
            return null;
        };
    }

    public static Specification<Complaint> withType(String type) {
        return (root, query, cb) -> {
            if (type != null && !type.isEmpty()) {
                return cb.like(cb.lower(root.get("type")), "%" + type.toLowerCase() + "%");
            }
            return null;
        };
    }
}
