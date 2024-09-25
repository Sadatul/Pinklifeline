package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.service.EmailService;
import com.sadi.pinklifeline.service.doctor.DoctorsInfoService;
import com.sadi.pinklifeline.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1")
public class VerificationHandler {
    private final DoctorsInfoService doctorsInfoService;
    private final EmailService emailService;
    @Value("${unverified.page-size}")
    private int pageSize;

    public VerificationHandler(DoctorsInfoService doctorsInfoService, EmailService emailService) {
        this.doctorsInfoService = doctorsInfoService;
        this.emailService = emailService;
    }


    @GetMapping("/doctors")
    public ResponseEntity<PagedModel<Map<String, Object>>> getUnverifiedDoctors(
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String regNo,
            @RequestParam(required = false) String workplace,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String designation,
            @RequestParam(required = false) String contactNumber,
            @RequestParam(required = false) String qualifications,
            @RequestParam(required = false, defaultValue = "Y") YesNo isVerified,
            @RequestParam(required = false, defaultValue = "0") Integer pageNo
    ) {
        List<String> qualificationList = qualifications != null ?
                Arrays.asList(qualifications.split(",")) :
                new ArrayList<>();
        if(isVerified.equals(YesNo.N) && !SecurityUtils.hasRole("ROLE_ADMIN")){
            throw new AuthorizationDeniedException(
                    "Only Admin has access to unverified doctors", () -> false
            );
        }
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(Sort.Direction.ASC, "userId"));
        Specification<DoctorDetails> spec = doctorsInfoService.getSpecification(fullName, regNo, qualificationList, workplace,
                department, designation, contactNumber, isVerified);
        Page<DoctorDetails> doctorPage = doctorsInfoService.getDoctors(spec, pageable);
        List<Map<String, Object>> content = doctorsInfoService.convertDoctorDetailsToMap(doctorPage.getContent());
        Page<Map<String, Object>> result = new PageImpl<>(content, pageable, doctorPage.getTotalElements());
        return ResponseEntity.ok(new PagedModel<>(result));
    }

    @PutMapping("/ROLE_ADMIN/verify/doctors/{id}")
    public ResponseEntity<Void> verifyDoctors(@PathVariable Long id){
        String username = doctorsInfoService.verifyDoctor(id);
        emailService.sendSimpleEmail(username, "Verification", "Your account has been approved by our admin. Please log out and log back in to apply the changes.");
        return ResponseEntity.noContent().build();
    }
}
