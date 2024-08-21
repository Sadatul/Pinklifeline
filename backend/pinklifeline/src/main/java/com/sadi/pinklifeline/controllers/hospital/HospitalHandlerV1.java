package com.sadi.pinklifeline.controllers.hospital;

import com.sadi.pinklifeline.models.entities.hospital.Hospital;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@RestController
@RequestMapping("/v1")
public class HospitalHandlerV1 {
    @Value("${hospitals.page-size}")
    private int pageSize;
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

    @GetMapping("/anonymous/hospitals")
    public ResponseEntity<PagedModel<Map<String, Object>>> getHospitals(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String testIds,
            @RequestParam(required = false, defaultValue = "ASC") Sort.Direction sortDirection,
            @RequestParam(required = false, defaultValue = "0") Integer pageNo
    ){
        Set<Long> testIdSet = testIds != null ? Arrays.stream(testIds.split(","))
                .map(Long::parseLong).collect(Collectors.toSet()) : new HashSet<>();

        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(sortDirection, "name"));
        Specification<Hospital> spec = hospitalHandlerService.getSpecification(id, name, location, testIdSet);
        Page<Hospital> hospitalPage = hospitalHandlerService.getHospitals(spec, pageable);
        List<Map<String, Object>> content = hospitalPage.getContent().stream()
                .map((val) -> Stream.of(new Object[][]{
                        {"id", val.getId()},
                        {"name", val.getName()},
                        {"description", val.getDescription()},
                        {"location", val.getLocation()},
                        {"contactNumber", val.getContactNumber()},
                        {"email", val.getEmail()},
                }).collect(Collectors.toMap(data -> (String) data[0], data -> data[1]))).toList();
        PageImpl<Map<String, Object>> res = new PageImpl<>(content, pageable, hospitalPage.getTotalElements());
        return ResponseEntity.ok(new PagedModel<>(res));

    }

    @GetMapping("/anonymous/hospitals/tests")
    public ResponseEntity<List<Map<String, Object>>> getMedicalTests(
            @RequestParam Long hospitalId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String testIds
    ) {
        Set<Long> testIdSet = testIds != null ? Arrays.stream(testIds.split(","))
                .map(Long::parseLong).collect(Collectors.toSet()) : null;
        return ResponseEntity.ok(hospitalHandlerService.getTestByHospital(hospitalId, name, testIdSet));
    }

    @GetMapping("/anonymous/hospitals/compare")
    public ResponseEntity<Map<Long, Object>> getFeesForComparison(
            @RequestParam Long testId,
            @RequestParam(required = false) String hospitalIds
    ) {
        Set<Long> hospitalIdSet = hospitalIds != null ? Arrays.stream(hospitalIds.split(","))
                .map(Long::parseLong).collect(Collectors.toSet()) : new HashSet<>();
        log.info(hospitalIdSet.toString());
        if(hospitalIdSet.isEmpty()) return ResponseEntity.ok(new HashMap<>());
        return ResponseEntity.ok(hospitalHandlerService.getFeesForComparison(hospitalIdSet, testId));
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
