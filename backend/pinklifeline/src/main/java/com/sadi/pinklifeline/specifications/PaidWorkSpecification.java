package com.sadi.pinklifeline.specifications;

import com.sadi.pinklifeline.enums.PaidWorkStatus;
import com.sadi.pinklifeline.models.entities.PaidWork;
import com.sadi.pinklifeline.utils.BasicUtils;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public class PaidWorkSpecification {
    public static Specification<PaidWork> withStatus(PaidWorkStatus status) {
        return (root, query, cb) -> {
            if (status != null) {
                return cb.equal(root.get("status"), status);
            }
            return null;
        };
    }
    public static Specification<PaidWork> withDateBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (startDate != null && endDate != null) {
                return cb.between(root.get("createdAt"), startDate, endDate);
            }
            return null;
        };
    }

    public static Specification<PaidWork> withTags(List<String> tags) {
        return (root, query, cb) -> {
            if (tags != null && !tags.isEmpty()) {
                Set<String> lowercaseTags = BasicUtils.convertToLowerCaseFromListToSet(tags);

                Subquery<Long> subquery = query.subquery(Long.class);
                Root<PaidWork> subRoot = subquery.correlate(root);
                Join<PaidWork, String> tagJoin = subRoot.join("tags");

                subquery.select(cb.countDistinct(tagJoin))
                        .where(cb.lower(tagJoin).in(lowercaseTags));

                return cb.equal(subquery, (long) lowercaseTags.size());
            }
            return null;
        };
    }

    public static Specification<PaidWork> withUserId(Long userId) {
        return (root, query, cb) -> {
            if (userId != null) {
                return cb.equal(root.get("user").get("id"), userId);
            }
            return null;
        };
    }

    public static Specification<PaidWork> withProviderId(Long providerId) {
        return (root, query, cb) -> {
            if (providerId != null) {
                return cb.equal(root.get("healCareProvider").get("userId"), providerId);
            }
            return null;
        };
    }

    public static Specification<PaidWork> withAddress(String address) {
        return (root, query, cb) -> {
            if (address != null && !address.isEmpty()) {
                return cb.like(cb.lower(root.get("address")), "%" + address.toLowerCase() + "%");
            }
            return null;
        };
    }
}
