package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.entities.Report;
import com.sadi.pinklifeline.models.reqeusts.ReportReq;
import com.sadi.pinklifeline.service.ReportHandlerService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
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

    private final ReportHandlerService reportHandlerService;
    public ReportHandlerV1(ReportHandlerService reportHandlerService) {
        this.reportHandlerService = reportHandlerService;
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
            @PathVariable Long id) {
        log.debug("Delete report for id {}", id);
        reportHandlerService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getReports(
            @RequestParam(required = false, defaultValue = "1000-01-01") LocalDate startDate,
            @RequestParam(required = false, defaultValue = "9999-12-31") LocalDate endDate,
            @RequestParam(required = false) String keywords,
            @RequestParam(required = false) String hospitalName,
            @RequestParam(required = false) String doctorName,
            @RequestParam(required = false) Sort.Direction sort) {
        log.info("Get reports for {}", keywords);
        List<String> keywordList = keywords != null ?
                Arrays.asList(keywords.split(",")) :
                new ArrayList<>();

        List<Report> reports = reportHandlerService.findReports(startDate, endDate, keywordList,
                hospitalName, doctorName, sort);
        List<Map<String, Object>> reportMapList = new ArrayList<>();
        for (Report report : reports) {
            Map<String, Object> reportMap = new HashMap<>();
            reportMap.put("id", report.getId());
            reportMapList.add(reportMap);
        }
        return ResponseEntity.ok(reportMapList);
    }
}
