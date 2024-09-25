package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.responses.NearbyUserRes;
import com.sadi.pinklifeline.service.PatientSpecificFeaturesService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1")
@Slf4j
public class PatientSpecificFeaturesV1 {

    private final PatientSpecificFeaturesService patientService;

    public PatientSpecificFeaturesV1(PatientSpecificFeaturesService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/ROLE_PATIENT/nearby/{id}")
    public ResponseEntity<List<NearbyUserRes>> nearByUsers(@PathVariable Long id){
        return ResponseEntity.ok(patientService.getNearbyUsers(id));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<NearbyUserRes>> nearByUsersByLocation(
            @RequestParam String location
    ){
        return ResponseEntity.ok(patientService.getNearbyUsers(location));
    }

    @PutMapping("/ROLE_PATIENT/toggle-location-share")
    public ResponseEntity<Map<String, Object>> updateLocationShare(){

        log.debug("location share update req received for user");
        Boolean status = patientService.updatePatientLocationShare();
        return ResponseEntity.ok(Collections.singletonMap("locationShare", status));
    }
}
