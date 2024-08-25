package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.SubscriptionType;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.dtos.ReportSharedInfoDTO;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.entities.Report;
import com.sadi.pinklifeline.models.entities.SharedReport;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.ReportReq;
import com.sadi.pinklifeline.models.reqeusts.ReportShareReq;
import com.sadi.pinklifeline.repositories.ReportRepository;
import com.sadi.pinklifeline.repositories.SharedReportRepository;
import com.sadi.pinklifeline.service.doctor.DoctorsInfoService;
import com.sadi.pinklifeline.specifications.ReportSpecification;
import com.sadi.pinklifeline.utils.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class ReportHandlerService {

    private final UserService userService;
    private final ReportRepository reportRepository;
    private final DoctorsInfoService doctorsInfoService;
    private final SharedReportRepository sharedReportRepository;

    public ReportHandlerService(UserService userService, ReportRepository reportRepository, DoctorsInfoService doctorsInfoService, SharedReportRepository sharedReportRepository) {
        this.userService = userService;
        this.reportRepository = reportRepository;
        this.doctorsInfoService = doctorsInfoService;
        this.sharedReportRepository = sharedReportRepository;
    }

    public Report getReport(Long id) {
        return reportRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                String.format("Report with id %s not found", id)
        ));
    }

    @PreAuthorize("hasAnyRole('BASICUSER', 'PATIENT')")
    public Long addReport(ReportReq req) {
        Long userId = SecurityUtils.getOwnerID();
        SecurityUtils.throwExceptionIfNotSubscribed(SubscriptionType.USER_MONTHLY,
                SubscriptionType.USER_YEARLY);
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

    @PreAuthorize("hasAnyRole('BASICUSER', 'PATIENT')")
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

    @PreAuthorize("hasAnyRole('BASICUSER', 'PATIENT')")
    public void deleteReport(Long id, Boolean force) {
        Long userId = SecurityUtils.getOwnerID();
        List<ReportSharedInfoDTO> dtos = sharedReportRepository.findSharedReportInfoByReportId(id,
                LocalDateTime.now());
        if(!dtos.isEmpty() && !force){
            throw new BadRequestFromUserException(
                    String.format("Report with id:%d is shared to %d doctors", id, dtos.size())
            );
        }
        Report report = getReport(id);
        verifyReportOwner(report, userId);
        reportRepository.delete(report);
    }

    @PreAuthorize("hasAnyRole('BASICUSER', 'PATIENT')")
    public Page<Report> findReports(LocalDate startDate, LocalDate endDate,
                                    List<String> keywords, String hospitalName, String doctorName,
                                    Sort.Direction sortDirection, Pageable pageable) {
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
        return reportRepository.findAll(spec, pageable);
    }

    @PreAuthorize("hasAnyRole('BASICUSER', 'PATIENT')")
    public Long shareReport(ReportShareReq req) {
        Long userId = SecurityUtils.getOwnerID();
        Report report = getReport(req.getReportId());
        verifyReportOwner(report, userId);

        Optional<SharedReport> sr = sharedReportRepository.findSharedReportByReportIdAndDocId(
                req.getReportId(),req.getDoctorId(), LocalDateTime.now());
        if(sr.isPresent()) {
            throw new BadRequestFromUserException(
                    String.format("Doctor with id: %d already has access to the report with id: %d", req.getDoctorId(), req.getReportId())
            );
        }

        DoctorDetails doctorDetails = doctorsInfoService.getDoctorIfVerified(req.getDoctorId());
        LocalDateTime expiredAt = null;
        if(req.getPeriod() != null){
            expiredAt = LocalDateTime.now().plusHours(req.getPeriod());
        }

        SharedReport sharedReport = new SharedReport(report, doctorDetails, expiredAt);
        return sharedReportRepository.save(sharedReport).getId();
    }

    @PreAuthorize("hasAnyRole('BASICUSER', 'PATIENT')")
    public void revokeShareReport(Long shareId) {
        SharedReport sharedReport = getSharedReportWithReportInfo(shareId);
        Long userId = SecurityUtils.getOwnerID();
        verifyReportOwner(sharedReport.getReport(), userId);

        sharedReportRepository.delete(sharedReport);
    }

    public SharedReport getSharedReportWithReportInfo(Long shareId) {
        return sharedReportRepository.findByIdWithReport(shareId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("ReportShare entry with id %s not found", shareId)
                ));
    }
    @PreAuthorize("hasAnyRole('BASICUSER', 'PATIENT')")
    public List<ReportSharedInfoDTO> getSharedInfoForUserByReportId(Long reportId) {
        Long userId = SecurityUtils.getOwnerID();
        Report report = getReport(reportId);
        verifyReportOwner(report, userId);

        return sharedReportRepository.findSharedReportInfoByReportId(reportId, LocalDateTime.now());
    }
}