package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.enums.ComplaintResourceType;
import com.sadi.pinklifeline.models.dtos.ComplaintDTO;
import com.sadi.pinklifeline.models.entities.Complaint;
import com.sadi.pinklifeline.models.reqeusts.ComplaintReq;
import com.sadi.pinklifeline.service.ComplaintHandlerService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/v1")
@Slf4j
public class ComplaintHandlerV1 {
    private final ComplaintHandlerService complaintHandlerService;

    @Value("${complaints.page-size}")
    private int pageSize;

    public ComplaintHandlerV1(ComplaintHandlerService complaintHandlerService) {
        this.complaintHandlerService = complaintHandlerService;
    }

    @PostMapping("/complaints")
    public ResponseEntity<Void> createComplaint(@Valid @RequestBody ComplaintReq req)
    {
        log.debug("Add complaint req: {}", req);
        Long id = complaintHandlerService.addComplaint(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }

    @GetMapping("/ROLE_ADMIN/complaints")
    public ResponseEntity<PagedModel<Map<String, Object>>> getComplaints(
            @RequestParam(required = false, defaultValue = "1000-01-01") LocalDate startDate,
            @RequestParam(required = false, defaultValue = "9999-12-31") LocalDate endDate,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) ComplaintResourceType type,
            @RequestParam(required = false, defaultValue = "ASC") Sort.Direction sortDirection,
            @RequestParam(required = false, defaultValue = "0") Integer pageNo) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(sortDirection, "createdAt"));
        Specification<Complaint> spec = complaintHandlerService.getSpecification(startDate.atStartOfDay(),
                endDate.atTime(23, 59), category, type);

        Page<Complaint> complaintPage = complaintHandlerService.getComplaints(spec, pageable);
        List<Map<String, Object>> content = complaintPage.getContent().stream()
                .map((complaint -> Stream.of(new Object[][] {
                        { "id", complaint.getId() },
                        { "resourceId", complaint.getResourceId() },
                        { "type", complaint.getType() },
                        { "category", complaint.getCategory() },
                        { "description", complaint.getDescription() },
                        { "createdAt", complaint.getCreatedAt() }
                }).collect(Collectors.toMap(data -> (String) data[0], data -> data[1]))
                )).toList();
        Page<Map<String, Object>> result = new PageImpl<>(content, pageable, complaintPage.getTotalElements());
        return ResponseEntity.ok(new PagedModel<>(result));
    }

    @DeleteMapping("/ROLE_ADMIN/complaints/{id}")
    public ResponseEntity<Void> resolveComplaint(@PathVariable Long id,
                                                 @RequestParam Boolean violation) {
        ComplaintDTO dto = complaintHandlerService.getComplaintDTO(id);
        if(!violation) {
            complaintHandlerService.sendViolationsNotFoundMail(dto.getUsername(), dto.getFullName(),
                    dto.getType().toString().toLowerCase());
        }
        else{
            complaintHandlerService.deleteResource(dto.getResourceId(), dto.getType());
            complaintHandlerService.sendViolationFoundMail(dto.getUsername(), dto.getFullName(),
                    dto.getType().toString().toLowerCase());
        }
        complaintHandlerService.deleteComplaintById(dto.getId());
        return ResponseEntity.noContent().build();
    }
}
