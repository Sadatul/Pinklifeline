package com.sadi.pinklifeline.controllers.doctor;

import com.sadi.pinklifeline.models.reqeusts.DoctorLocationReq;
import com.sadi.pinklifeline.service.doctor.features.DoctorConsultancyLocationsService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/v1/ROLE_DOCTOR")
@Slf4j
public class DoctorConsultancyLocationControllerV1 {
    private final DoctorConsultancyLocationsService locationService;

    public DoctorConsultancyLocationControllerV1(DoctorConsultancyLocationsService locationService) {
        this.locationService = locationService;
    }

    @PostMapping("{doc_id}/locations")
    public ResponseEntity<Void> addLocations(
            @PathVariable(name = "doc_id") Long docId,
            @Valid @RequestBody DoctorLocationReq req) {
        log.debug("Post request on doctor locations received: {}", req);
        Long id = locationService.addLocation(req, docId);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("{doc_id}/locations/{location_id}")
    public ResponseEntity<Void> updateLocation(
            @PathVariable(name = "doc_id") Long docId,
            @PathVariable(name = "location_id") Long locationId,
            @Valid @RequestBody DoctorLocationReq req) {
        log.debug("Put request on doctor locations received: {}", req);
        locationService.updateLocation(req, locationId, docId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("{doc_id}/locations/{location_id}")
    public ResponseEntity<Void> deleteLocation(
            @PathVariable(name = "doc_id") Long docId,
            @PathVariable(name = "location_id") Long locationId) {
        log.debug("Delete request on doctor locations with id: {}", locationId);
        locationService.deleteLocation(locationId, docId);
        return ResponseEntity.noContent().build();
    }
}
