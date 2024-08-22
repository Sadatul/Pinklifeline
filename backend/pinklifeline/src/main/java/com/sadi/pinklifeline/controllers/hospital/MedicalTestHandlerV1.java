package com.sadi.pinklifeline.controllers.hospital;

import com.sadi.pinklifeline.models.reqeusts.MedicalTestReq;
import com.sadi.pinklifeline.service.hospital.MedicalTestHandlerService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;

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

    @GetMapping("/anonymous/medical-tests")
    public ResponseEntity<List<Map<String, Object>>> getMedicalTests(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long id,
            @RequestParam(required = false, defaultValue = "ASC") Sort.Direction sortDirection,
            @RequestParam(required = false, defaultValue = "false") Boolean desc
    ) {
        return ResponseEntity.ok(medicalTestHandlerService.getMedicalTests(name, id, desc, Sort.by(sortDirection,"name")));
    }
}
