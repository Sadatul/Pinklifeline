package com.sadi.pinklifeline.controllers.hospital;

import com.sadi.pinklifeline.models.reqeusts.HospitalReq;
import com.sadi.pinklifeline.models.reqeusts.HospitalTestReq;
import com.sadi.pinklifeline.service.hospital.HospitalHandlerService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@Slf4j
@RestController
@RequestMapping("/v1")
public class HospitalHandlerV1 {
    private final HospitalHandlerService hospitalHandlerService;

    public HospitalHandlerV1(HospitalHandlerService hospitalHandlerService) {
        this.hospitalHandlerService = hospitalHandlerService;
    }


    @PostMapping("/ROLE_ADMIN/hospitals")
    public ResponseEntity<Void> addHospital(@Valid @RequestBody HospitalReq req){
        log.debug("Add hospital req: {}", req);
        Long id = hospitalHandlerService.addHospital(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/ROLE_ADMIN/hospitals/{id}")
    public ResponseEntity<Void> updateHospital(@PathVariable Long id,
                                               @Valid @RequestBody HospitalReq req)
    {
        log.debug("Update hospital req: {}", req);
        hospitalHandlerService.updateHospital(id, req);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/ROLE_ADMIN/hospitals/{id}")
    public ResponseEntity<Void> deleteHospital(
            @PathVariable Long id){
        log.debug("delete hospital with id: {}", id);
        hospitalHandlerService.deleteHospital(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ROLE_ADMIN/hospitals/tests")
    public ResponseEntity<Void> addTestToHospital(@Valid @RequestBody HospitalTestReq req){
        log.debug("Add test to hospital req: {}", req);
        Long id = hospitalHandlerService.addTestToHospital(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/ROLE_ADMIN/hospitals/tests/{id}")
    public ResponseEntity<Void> updateTestInHospital(@PathVariable Long id,
                                                     @Valid @RequestBody UpdateHospitalTestReq req){
        log.debug("Update test in hospital req: {}", req);
        hospitalHandlerService.updateTestToHospital(id, req);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/ROLE_ADMIN/hospitals/tests/{id}")
    public ResponseEntity<Void> deleteTestInHospital(
            @PathVariable Long id){
        log.debug("delete test in hospital with id: {}", id);
        hospitalHandlerService.deleteTestFromHospital(id);
        return ResponseEntity.noContent().build();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @ToString
    public static class UpdateHospitalTestReq {
        @NotNull
        private Integer fee;
    }
}
