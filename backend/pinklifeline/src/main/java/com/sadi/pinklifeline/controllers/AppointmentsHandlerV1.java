package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.reqeusts.RegisterAppointmentReq;
import com.sadi.pinklifeline.service.AppointmentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalTime;

@RestController
@RequestMapping("/v1/appointments")
public class AppointmentsHandlerV1 {
    private final AppointmentService appointmentService;

    public AppointmentsHandlerV1(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<Void> createAppointment(@Valid @RequestBody RegisterAppointmentReq req){
        Long id = appointmentService.addAppointment(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<Void> acceptAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AcceptAppointmentReq req
    ){
        appointmentService.acceptAppointment(id, req.getTime());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<Void> deleteAppointment(
            @PathVariable Long id
    ){
        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/decline")
    public ResponseEntity<Void> declineAppointment(
            @PathVariable Long id
    ){
        appointmentService.declineAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @ToString
    public static class AcceptAppointmentReq{
        @NotNull
        private LocalTime time;
    }
}
