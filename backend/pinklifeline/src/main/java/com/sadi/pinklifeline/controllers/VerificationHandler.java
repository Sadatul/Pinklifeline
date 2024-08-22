package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.service.doctor.DoctorsInfoService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/ROLE_ADMIN")
public class VerificationHandler {
    private final DoctorsInfoService doctorsInfoService;
    @Value("${unverified.page-size}")
    private int pageSize;

    public VerificationHandler(DoctorsInfoService doctorsInfoService) {
        this.doctorsInfoService = doctorsInfoService;
    }


    @GetMapping("/unverified/doctors")
    public ResponseEntity<PagedModel<Map<String, Object>>> getUnverifiedDoctors(
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String regNo,
            @RequestParam(required = false) String workplace,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String designation,
            @RequestParam(required = false) String contactNumber,
            @RequestParam(required = false) String qualifications,
            @RequestParam(required = false, defaultValue = "0") Integer pageNo
    ) {
        List<String> qualificationList = qualifications != null ?
                Arrays.asList(qualifications.split(",")) :
                new ArrayList<>();

        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(Sort.Direction.ASC, "userId"));
        Specification<DoctorDetails> spec = doctorsInfoService.getSpecification(fullName, regNo, qualificationList, workplace,
                department, designation, contactNumber, YesNo.N);
        Page<DoctorDetails> doctorPage = doctorsInfoService.getDoctors(spec, pageable);
        List<Map<String, Object>> content = doctorsInfoService.convertDoctorDetailsToMap(doctorPage.getContent());
        Page<Map<String, Object>> result = new PageImpl<>(content, pageable, doctorPage.getTotalElements());
        return ResponseEntity.ok(new PagedModel<>(result));
    }

    @PutMapping("/verify/doctors/{id}")
    public ResponseEntity<Void> verifyDoctors(@PathVariable Long id){
        doctorsInfoService.verifyDoctor(id);
        return ResponseEntity.noContent().build();
    }
}
