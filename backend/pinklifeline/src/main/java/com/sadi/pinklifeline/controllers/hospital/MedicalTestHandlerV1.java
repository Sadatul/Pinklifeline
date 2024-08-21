package com.sadi.pinklifeline.controllers.hospital;

import com.sadi.pinklifeline.models.reqeusts.MedicalTestReq;
import com.sadi.pinklifeline.service.hospital.MedicalTestHandlerService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@Slf4j
@RequestMapping("/v1")
public class MedicalTestHandlerV1 {
    private final MedicalTestHandlerService medicalTestHandlerService;

    public MedicalTestHandlerV1(MedicalTestHandlerService medicalTestHandlerService) {
        this.medicalTestHandlerService = medicalTestHandlerService;
    }

    @PostMapping("/ROLE_ADMIN/medical-tests")
    public ResponseEntity<Void> addMedicalTest(@Valid @RequestBody MedicalTestReq req){
        log.debug("Add medical-test req: {}", req);
        Long id = medicalTestHandlerService.addMedicalTest(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/ROLE_ADMIN/medical-tests/{id}")
    public ResponseEntity<Void> updateMedicalTest(@PathVariable Long id,
                                                  @Valid @RequestBody MedicalTestReq req)
    {
        log.debug("Update medicalTest req: {}", req);
        medicalTestHandlerService.updateMedicalTest(id, req);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/ROLE_ADMIN/medical-tests/{id}")
    public ResponseEntity<Void> deleteMedicalTest(
            @PathVariable Long id){
        log.debug("delete medicalTest with id: {}", id);
        medicalTestHandlerService.deleteMedicalTest(id);
        return ResponseEntity.noContent().build();
    }
}
