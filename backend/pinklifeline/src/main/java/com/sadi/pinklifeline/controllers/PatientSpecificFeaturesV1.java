package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.NearbyUserRes;
import com.sadi.pinklifeline.service.PatientSpecificFeaturesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/ROLE_PATIENT")
public class PatientSpecificFeaturesV1 {

    private final PatientSpecificFeaturesService patientService;

    public PatientSpecificFeaturesV1(PatientSpecificFeaturesService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/nearby/{id}")
    public ResponseEntity<List<NearbyUserRes>> nearByUsers(@PathVariable Long id){
        return ResponseEntity.ok(patientService.getNearbyUsers(id));
    }
}
