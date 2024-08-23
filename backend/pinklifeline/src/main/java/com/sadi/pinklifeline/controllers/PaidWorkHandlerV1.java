package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.reqeusts.PaidWorkReq;
import com.sadi.pinklifeline.service.PaidWorkHandlerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RequestMapping("/v1/works")
@RestController
@Slf4j
@RequiredArgsConstructor
public class PaidWorkHandlerV1 {
    private final PaidWorkHandlerService paidWorkHandlerService;

    @PostMapping
    public ResponseEntity<Void> addPaidWork(@Valid @RequestBody PaidWorkReq req){
        log.debug("Add paid work req {}", req);
        Long id = paidWorkHandlerService.addPaidWork(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePaidWork(
            @PathVariable Long id,
            @Valid @RequestBody PaidWorkReq req){
        log.debug("update paid work req {}", req);
        paidWorkHandlerService.updatePaidWork(req, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaidWork(
            @PathVariable Long id){
        log.debug("delete paid work with id: {}", id);
        paidWorkHandlerService.deletePaidWork(id);
        return ResponseEntity.noContent().build();
    }
}
