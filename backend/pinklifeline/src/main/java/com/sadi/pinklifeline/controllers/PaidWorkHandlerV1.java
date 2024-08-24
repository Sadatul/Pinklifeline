package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.reqeusts.PaidWorkReq;
import com.sadi.pinklifeline.service.EmailService;
import com.sadi.pinklifeline.service.PaidWorkHandlerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@RequestMapping("/v1/works")
@RestController
@Slf4j
@RequiredArgsConstructor
public class PaidWorkHandlerV1 {
    private final PaidWorkHandlerService paidWorkHandlerService;
    private final EmailService emailService;

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

    @PutMapping("/{id}/reserve")
    public ResponseEntity<Void> reservePaidWork(
            @PathVariable Long id){
        log.debug("Trying to reserve paid work with id: {}", id);
        Map<String, String> data = paidWorkHandlerService.reservePaidWork(id);
        emailService.sendSimpleEmail(data.get("username"),
                "A Doctor is Interested in Your Task",
                String.format("A doctor has shown interest in your task, \"%s\". Please check your account for more details.",data.get("title")));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/reserve")
    public ResponseEntity<Void> removeReserveFromPaidWork(
            @PathVariable Long id){
        log.debug("Remove reserve from paid work with id: {}", id);
        Map<String, String> data = paidWorkHandlerService.removeReserveFromWork(id);
        emailService.sendSimpleEmail(data.get("username"),
                "Task Reservation Canceled:",
                String.format("The user has canceled reservation on task, \"%s\". Please check your account for more details.",data.get("title")));
        return ResponseEntity.noContent().build();
    }
}
