package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.enums.AppointmentStatus;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.models.entities.Appointment;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.RegisterAppointmentReq;
import com.sadi.pinklifeline.service.AppointmentService;
import com.sadi.pinklifeline.service.UserService;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/v1/appointments")
@Slf4j
public class AppointmentsHandlerV1 {
    private final AppointmentService appointmentService;
    private final UserService userService;

    public AppointmentsHandlerV1(AppointmentService appointmentService, UserService userService) {
        this.appointmentService = appointmentService;
        this.userService = userService;
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

    @PutMapping("/{id}/finish")
    public ResponseEntity<Void> finishAppointment(
            @PathVariable Long id
    ){
        appointmentService.finishAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAppointments(){
        List<Map<String, Object>> res;
        if(SecurityUtils.hasRole("ROLE_DOCTOR")) {
            res = appointmentService.getAppointmentsByDocId();
            return ResponseEntity.ok(res);
        }
        else if (SecurityUtils.hasRole("ROLE_BASICUSER") || SecurityUtils.hasRole("ROLE_PATIENT")){
            res = appointmentService.getAppointmentsByPatientId();
            return ResponseEntity.ok(res);
        }
        throw new BadRequestFromUserException("User is not authorized for this endpoint");
    }

    @GetMapping("/user-data/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> getUserData(
            @PathVariable Long id
    ){
        Appointment appointment = appointmentService.getAppointment(id);
        Long docId = SecurityUtils.getOwnerID();
        appointmentService.verifyAppointmentDoctorAccess(appointment, docId);
        AppointmentStatus status = appointment.getStatus();
        if(!(status.equals(AppointmentStatus.ACCEPTED) ||
                status.equals(AppointmentStatus.REQUESTED) ||
                status.equals(AppointmentStatus.RUNNING))){
            throw new BadRequestFromUserException("Cannot request user info for this appointment");
        }
        User user = userService.getUser(appointment.getUser().getId());
        Map<String, Object> userData = new HashMap<>();
        userService.injectBasicUserDetailsToMap(user.getBasicUser(), userData);
        if(user.getPatientSpecificDetails() != null){
            userService.injectPatientSpecificDetailsToMap(user.getPatientSpecificDetails(), userData);
        }
        userData.remove("location"); // Tried to reuse existing code
        userData.put("age", ChronoUnit.YEARS.between((LocalDate) userData.get("dob"), LocalDate.now()));
        userData.remove("dob"); // Tried to reuse existing code
        return ResponseEntity.ok(userData);
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
