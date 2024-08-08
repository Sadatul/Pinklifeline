package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.enums.SharedReportType;
import com.sadi.pinklifeline.models.dtos.ReportSharedInfoDTO;
import com.sadi.pinklifeline.models.dtos.SharedReportDTO;
import com.sadi.pinklifeline.models.entities.Report;
import com.sadi.pinklifeline.models.entities.SharedReport;
import com.sadi.pinklifeline.models.reqeusts.ReportReq;
import com.sadi.pinklifeline.models.reqeusts.ReportShareReq;
import com.sadi.pinklifeline.service.ReportHandlerService;
import com.sadi.pinklifeline.service.SharedReportFilterService;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/v1/reports")
@Slf4j
public class ReportHandlerV1 {

    @Value("${report.user.get.page-size}")
    private Integer userReportPageSize;

    private final ReportHandlerService reportHandlerService;
    private final SharedReportFilterService sharedReportFilterService;
    public ReportHandlerV1(ReportHandlerService reportHandlerService, SharedReportFilterService sharedReportFilterService) {
        this.reportHandlerService = reportHandlerService;
        this.sharedReportFilterService = sharedReportFilterService;
    }

    @PostMapping
    public ResponseEntity<Void> addReport(@Valid @RequestBody ReportReq req) {
        log.debug("Adding report req {}", req);
        Long id = reportHandlerService.addReport(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateReport(
            @PathVariable Long id,
            @Valid @RequestBody ReportReq req) {
        log.debug("Update report req {}", req);
        reportHandlerService.updateReport(id, req);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "false") Boolean force
    ) {
        log.debug("Delete report for id {}", id);
        reportHandlerService.deleteReport(id, force);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<Map<String, Object>>> getReports(
            @RequestParam(required = false, defaultValue = "1000-01-01") LocalDate startDate,
            @RequestParam(required = false, defaultValue = "9999-12-31") LocalDate endDate,
            @RequestParam(required = false) String keywords,
            @RequestParam(required = false) String hospitalName,
            @RequestParam(required = false) String doctorName,
            @RequestParam(required = false) Sort.Direction sort,
            @RequestParam(required = false, defaultValue = "0") Integer pageNo) {
        log.info("Get reports for {}", keywords);
        List<String> keywordList = keywords != null ?
                Arrays.asList(keywords.split(",")) :
                new ArrayList<>();

        Pageable pageable = PageRequest.of(pageNo, userReportPageSize);

        Page<Report> page = reportHandlerService.findReports(startDate, endDate, keywordList,
                hospitalName, doctorName, sort, pageable);
        List<Report> reports = page.getContent();
        List<Map<String, Object>> reportMapList = new ArrayList<>();
        for (Report report : reports) {
            Map<String, Object> reportMap = new HashMap<>();
            reportMap.put("id", report.getId());
            reportMap.put("doctorName", report.getDoctorName());
            reportMap.put("hospitalName", report.getHospitalName());
            reportMap.put("date", report.getDate());
            reportMap.put("fileLink", report.getFileLink());
            reportMap.put("keywords", report.getKeywords());
            reportMap.put("summary", report.getSummary());
            reportMapList.add(reportMap);
        }
        Page<Map<String, Object>> result = new PageImpl<>(reportMapList, pageable, page.getTotalElements());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getReports(
            @PathVariable Long id
    ){
        Report report = reportHandlerService.getReport(id);
        Long userId = SecurityUtils.getOwnerID();
        reportHandlerService.verifyReportOwner(report, userId);
        Map<String, Object> reportMap = new HashMap<>();
        reportMap.put("id", report.getId());
        reportMap.put("doctorName", report.getDoctorName());
        reportMap.put("hospitalName", report.getHospitalName());
        reportMap.put("date", report.getDate());
        reportMap.put("fileLink", report.getFileLink());
        reportMap.put("keywords", report.getKeywords());
        reportMap.put("summary", report.getSummary());
        reportMap.put("shareInfo", reportHandlerService.getSharedInfoForUserByReportId(id));
        return ResponseEntity.ok(reportMap);
    }

    @PostMapping("/share")
    public ResponseEntity<Void> shareReport(
            @Valid @RequestBody ReportShareReq req) {
        log.debug("Share report req {}",  req);
        Long id = reportHandlerService.shareReport(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }

    @DeleteMapping("/share/{shareId}")
    public ResponseEntity<Void> revokeReport(
            @PathVariable Long shareId) {
        log.debug("Revoke share with id: {}",  shareId);
        reportHandlerService.revokeShareReport(shareId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/share")
    public ResponseEntity<Page<SharedReportDTO>> getSharedReportsFiltered(
            @RequestParam(required = false, defaultValue = "1000-01-01") LocalDate startDate,
            @RequestParam(required = false, defaultValue = "9999-12-31") LocalDate endDate,
            @RequestParam(required = false) String keywords,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String hospitalName,
            @RequestParam(required = false) String doctorName,
            @RequestParam(required = false, defaultValue = "ALL") SharedReportType type,
            @RequestParam(required = false, defaultValue = "0") Integer pageNo
    ){
        List<String> keywordList = keywords != null ?
                Arrays.asList(keywords.split(",")) :
                new ArrayList<>();
        Specification<SharedReport> spec = sharedReportFilterService.getSpecification(startDate, endDate, keywordList,
                username, hospitalName, doctorName, type);
        Pageable pageable = PageRequest.of(pageNo, userReportPageSize);
        Page<SharedReportDTO> reports;
        if(SecurityUtils.hasRole("ROLE_DOCTOR")){
            reports = sharedReportFilterService.filterShareReportsForDoctor(spec, pageable);
        }
        else {
            reports = sharedReportFilterService.filterShareReportsForUser(spec, pageable);
        }
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{reportId}/share")
    public ResponseEntity<List<ReportSharedInfoDTO>> getSharedInfoForReports(@PathVariable Long reportId){
        List<ReportSharedInfoDTO> reports = reportHandlerService.getSharedInfoForUserByReportId(reportId);
        return ResponseEntity.ok(reports);
    }
}
