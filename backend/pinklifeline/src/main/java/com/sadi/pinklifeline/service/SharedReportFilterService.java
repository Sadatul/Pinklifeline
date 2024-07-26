package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.SharedReportType;
import com.sadi.pinklifeline.models.dtos.SharedReportDTO;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.entities.Report;
import com.sadi.pinklifeline.models.entities.SharedReport;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.specifications.SharedReportSpecification;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class SharedReportFilterService {

    @PersistenceContext
    private EntityManager entityManager;

    public List<SharedReportDTO> filterShareReportsForDoctor(Specification<SharedReport> spec) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<SharedReportDTO> cq = cb.createQuery(SharedReportDTO.class);

        Root<SharedReport> root = cq.from(SharedReport.class);
        Join<SharedReport, Report> reportJoin = root.join("report", JoinType.LEFT);
        Join<Report, User> userJoin = reportJoin.join("user", JoinType.LEFT);

        List<Predicate> predicates = new ArrayList<>();
        if (spec != null) {
            Predicate specPredicate = spec.toPredicate(root, cq, cb);
            if (specPredicate != null) {
                predicates.add(specPredicate);
            }
        }
        cq.where(predicates.toArray(new Predicate[0]));
        cq.select(cb.construct(SharedReportDTO.class,
                root.get("id"),
                userJoin.get("username"),
                userJoin.get("basicUser").get("fullName"),
                root.get("expirationTime"),
                reportJoin.get("id"),
                reportJoin.get("doctorName"),
                reportJoin.get("date"),
                reportJoin.get("hospitalName"),
                reportJoin.get("summary"),
                reportJoin.get("fileLink")

        ));

        cq.orderBy(cb.asc(userJoin.get("username")));
        return entityManager.createQuery(cq).getResultList();
    }

    public List<SharedReportDTO> filterShareReportsForUser(Specification<SharedReport> spec) {

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<SharedReportDTO> cq = cb.createQuery(SharedReportDTO.class);

        Root<SharedReport> root = cq.from(SharedReport.class);
        Join<SharedReport, Report> reportJoin = root.join("report", JoinType.LEFT);
        Join<SharedReport, DoctorDetails> doctorJoin = root.join("doctor", JoinType.LEFT);

        List<Predicate> predicates = new ArrayList<>();
        if (spec != null) {
            Predicate specPredicate = spec.toPredicate(root, cq, cb);
            if (specPredicate != null) {
                predicates.add(specPredicate);
            }
        }
        cq.where(predicates.toArray(new Predicate[0]));
        cq.select(cb.construct(SharedReportDTO.class,
                root.get("id"),
                doctorJoin.get("user").get("username"),
                doctorJoin.get("fullName"),
                root.get("expirationTime"),
                reportJoin.get("id"),
                reportJoin.get("doctorName"),
                reportJoin.get("date"),
                reportJoin.get("hospitalName"),
                reportJoin.get("summary"),
                reportJoin.get("fileLink")

        ));

        cq.orderBy(cb.asc(doctorJoin.get("user").get("username")));
        return entityManager.createQuery(cq).getResultList();
    }

    public Specification<SharedReport> getSpecification(LocalDate startDate, LocalDate endDate,
                                                         List<String> keywords, String username, String hospitalName, String doctorName,
                                                         SharedReportType type) {
        Specification<com.sadi.pinklifeline.models.entities.SharedReport> spec = Specification.where(null);
        Long doctorId = SecurityUtils.getOwnerID();
        if(SecurityUtils.hasRole("ROLE_DOCTOR")) {
            spec = spec.and(SharedReportSpecification.withDoctorUserId(doctorId));
        }
        else{
            spec = spec.and(SharedReportSpecification.withUserId(doctorId));
        }
        if(type.equals(SharedReportType.ALL)){
            spec = spec.and(SharedReportSpecification.withExpirationTime()
                    .or(SharedReportSpecification.withExpirationTimeNull()));
        }
        else if(type.equals(SharedReportType.UNLIMITED)){
            spec = spec.and(SharedReportSpecification.withExpirationTimeNull());
        }
        else{
            spec = spec.and(SharedReportSpecification.withExpirationTime());
        }
        if (startDate != null && endDate != null) {
            spec = spec.and(SharedReportSpecification.withDateBetween(startDate, endDate));
        }
        if (keywords != null && !keywords.isEmpty()) {
            spec = spec.and(SharedReportSpecification.withKeywords(keywords));
        }
        if (hospitalName != null && !hospitalName.isEmpty()) {
            spec = spec.and(SharedReportSpecification.withHospitalNameLike(hospitalName));
        }
        if (doctorName != null && !doctorName.isEmpty()) {
            spec = spec.and(SharedReportSpecification.withDoctorNameLike(doctorName));
        }
        if (username != null && !username.isEmpty()) {
            if(SecurityUtils.hasRole("ROLE_DOCTOR")) {
                spec = spec.and(SharedReportSpecification.withUsername(username));
            }
            else{
                spec = spec.and(SharedReportSpecification.withDoctorUsername(username));
            }
        }
        return spec;
    }
}
