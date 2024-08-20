package com.sadi.pinklifeline.specifications;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.utils.BasicUtils;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Set;

public class DoctorDetailsSpecification {
    public static Specification<DoctorDetails> withFullName(String fullName) {
        return (root, query, cb) -> {
            if (fullName != null && !fullName.isEmpty()) {
                return cb.like(cb.lower(root.get("fullName")), "%" + fullName.toLowerCase() + "%");
            }
            return null;
        };
    }
    public static Specification<DoctorDetails> withRegistrationNumber(String registrationNumber) {
        return (root, query, cb) -> {
            if (registrationNumber != null && !registrationNumber.isEmpty()) {
                return cb.like(cb.lower(root.get("registrationNumber")), "%" + registrationNumber.toLowerCase() + "%");
            }
            return null;
        };
    }
    public static Specification<DoctorDetails> withWorkplace(String workplace) {
        return (root, query, cb) -> {
            if (workplace != null && !workplace.isEmpty()) {
                return cb.like(cb.lower(root.get("workplace")), "%" + workplace.toLowerCase() + "%");
            }
            return null;
        };
    }
    public static Specification<DoctorDetails> withDepartment(String department) {
        return (root, query, cb) -> {
            if (department != null && !department.isEmpty()) {
                return cb.like(cb.lower(root.get("department")), "%" + department.toLowerCase() + "%");
            }
            return null;
        };
    }
    public static Specification<DoctorDetails> withDesignation(String designation) {
        return (root, query, cb) -> {
            if (designation != null && !designation.isEmpty()) {
                return cb.like(cb.lower(root.get("designation")), "%" + designation.toLowerCase() + "%");
            }
            return null;
        };
    }
    public static Specification<DoctorDetails> withContactNumber(String contactNumber) {
        return (root, query, cb) -> {
            if (contactNumber != null && !contactNumber.isEmpty()) {
                return cb.like(cb.lower(root.get("contactNumber")), "%" + contactNumber.toLowerCase() + "%");
            }
            return null;
        };
    }

    public static Specification<DoctorDetails> withIsVerified(YesNo isVerified) {
        return (root, query, cb) -> {
            if (isVerified != null) {
                return cb.equal(root.get("isVerified"), isVerified);
            }
            return null;
        };
    }

    public static Specification<DoctorDetails> withQualification(List<String> qualifications) {
        return (root, query, cb) -> {
            if (qualifications != null && !qualifications.isEmpty()) {
                Set<String> lowercaseQualifications = BasicUtils.convertToLowerCaseFromListToSet(qualifications);

                Subquery<Long> subquery = query.subquery(Long.class);
                Root<DoctorDetails> subRoot = subquery.correlate(root);
                Join<DoctorDetails, String> qualificationJoin = subRoot.join("qualifications");

                subquery.select(cb.countDistinct(qualificationJoin))
                        .where(cb.lower(qualificationJoin).in(lowercaseQualifications));

                return cb.equal(subquery, (long) lowercaseQualifications.size());
            }
            return null;
        };
    }
}
