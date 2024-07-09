package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.reqeusts.DoctorLocationReq;
import com.sadi.pinklifeline.models.responses.NearbyUserRes;
import com.sadi.pinklifeline.service.doctor.features.DoctorConsultancyLocationsService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/v1/ROLE_DOCTOR")
@Slf4j
public class DoctorSpecificFeaturesV1 {
    private final DoctorConsultancyLocationsService locationService;

    public DoctorSpecificFeaturesV1(DoctorConsultancyLocationsService locationService) {
        this.locationService = locationService;
    }

    @PostMapping("{doc_id}/locations")
    public ResponseEntity<List<NearbyUserRes>> addLocations(
            @PathVariable(name = "doc_id") Long docId,
            @Valid @RequestBody DoctorLocationReq req) {
        log.debug("Post request on doctor locations received: {}", req);
        Long id = locationService.addLocation(req, docId);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }
}
