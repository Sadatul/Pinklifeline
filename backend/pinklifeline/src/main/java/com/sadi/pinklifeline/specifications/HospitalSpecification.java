package com.sadi.pinklifeline.specifications;

import com.sadi.pinklifeline.models.entities.hospital.Hospital;
import com.sadi.pinklifeline.models.entities.hospital.HospitalTest;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.Set;

public class HospitalSpecification {
    public static Specification<Hospital> withName(String name) {
        return (root, query, cb) -> {
            if (name != null && !name.isEmpty()) {
                return cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
            }
            return null;
        };
    }

    public static Specification<Hospital> withLocation(String location) {
        return (root, query, cb) -> {
            if (location != null && !location.isEmpty()) {
                return cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%");
            }
            return null;
        };
    }

    public static Specification<Hospital> withId(Long id) {
        return (root, query, cb) -> {
            if (id != null) {
                return cb.equal(root.get("id"), id);
            }
            return null;
        };
    }

    public static Specification<Hospital> withTests(Set<Long> testIds) {
        return (root, query, cb) -> {
            if (testIds != null && !testIds.isEmpty()) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<Hospital> subRoot = subquery.correlate(root);
                Join<Hospital, HospitalTest> testsJoin = subRoot.join("tests");

                subquery.select(cb.countDistinct(testsJoin.get("id")))
                        .where(testsJoin.get("test").get("id").in(testIds));

                return cb.equal(subquery, (long) testIds.size());
            }
            return null;
        };
    }
}
