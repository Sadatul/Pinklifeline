package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.Report;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.ReportReq;
import com.sadi.pinklifeline.repositories.ReportRepository;
import com.sadi.pinklifeline.specifications.ReportSpecification;
import com.sadi.pinklifeline.utils.SecurityUtils;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class ReportHandlerService {

    private final UserService userService;
    private final ReportRepository reportRepository;

    public ReportHandlerService(UserService userService, ReportRepository reportRepository) {
        this.userService = userService;
        this.reportRepository = reportRepository;
    }

    public Report getReport(Long id) {
        return reportRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                String.format("Report with id %s not found", id)
        ));
    }

    public Long addReport(ReportReq req) {
        Long userId = SecurityUtils.getOwnerID();
        User user = userService.getUserIfRegisteredOnlyId(userId);
        Report report = new Report(user, req.getDoctorName(), req.getHospitalName(), req.getDate(),
                req.getSummary(), req.getFileLink(), req.getKeywords());
        return reportRepository.save(report).getId();
    }

    public void verifyReportOwner(Report report, Long userId) {
        if (!Objects.equals(report.getUser().getId(), userId)) {
            throw new AuthorizationDeniedException(
                    String.format("User with id:%d doesn't have access to the report: %d"
                            , userId, report.getId()),
                    () -> false);
        }
    }

    public void updateReport(Long id, ReportReq req) {
        Long userId = SecurityUtils.getOwnerID();
        Report report = getReport(id);
        verifyReportOwner(report, userId);

        report.setDoctorName(req.getDoctorName());
        report.setHospitalName(req.getHospitalName());
        report.setDate(req.getDate());
        report.setSummary(req.getSummary());
        report.setFileLink(req.getFileLink());
        report.setKeywords(req.getKeywords());
        report.setTimestamp(LocalDateTime.now());

        reportRepository.save(report);
    }

    public void deleteReport(Long id) {
        Long userId = SecurityUtils.getOwnerID();
        Report report = getReport(id);
        verifyReportOwner(report, userId);
        reportRepository.delete(report);
    }

    public List<Report> findReports(LocalDate startDate, LocalDate endDate,
                                    List<String> keywords, String hospitalName, String doctorName,
                                    Sort.Direction sortDirection) {
        Long userId = SecurityUtils.getOwnerID();
        Specification<Report> spec = Specification.where(null);

        spec = spec.and(ReportSpecification.withUserId(userId));

        if (startDate != null && endDate != null) {
            spec = spec.and(ReportSpecification.withDateBetween(startDate, endDate));
        }

        if (keywords != null && !keywords.isEmpty()) {
            spec = spec.and(ReportSpecification.withKeywords(keywords));
        }

        if (hospitalName != null && !hospitalName.isEmpty()) {
            spec = spec.and(ReportSpecification.withHospitalNameLike(hospitalName));
        }

        if (doctorName != null && !doctorName.isEmpty()) {
            spec = spec.and(ReportSpecification.withDoctorNameLike(doctorName));
        }

        spec = spec.and(ReportSpecification.sortByTimestamp(sortDirection != null ? sortDirection : Sort.Direction.DESC));

        return reportRepository.findAll(spec);
    }
}