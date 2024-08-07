package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.service.UserService;
import com.sadi.pinklifeline.utils.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/v1/infos")
public class UserInfoForOwnerHandlerV1 {
    private final UserService userService;

    public UserInfoForOwnerHandlerV1(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile_picture")
    public ResponseEntity<Map<String, Object>> getUserProfilePicture(){
        Map<String, Object> response = new HashMap<>();
        Long id = SecurityUtils.getOwnerID();
        response.put("profilePicture", userService.getProfilePicture(id));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ROLE_BASICUSER/{id}")
    @PreAuthorize("(#id.toString() == authentication.name) and hasRole('BASICUSER')")
    public ResponseEntity<Map<String, Object>> getInfosForBasicUser(@PathVariable Long id){
        User user = userService.getUserIfRegistered(id);
        Map<String, Object> response = new HashMap<>();
        userService.injectBasicUserDetailsToMap(user.getBasicUser(), response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ROLE_PATIENT/{id}")
    @PreAuthorize("(#id.toString() == authentication.name) and hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> getInfosForPatient(@PathVariable Long id){
        User user = userService.getUserIfRegistered(id);
        Map<String, Object> response = new HashMap<>();
        userService.injectBasicUserDetailsToMap(user.getBasicUser(), response);
        userService.injectPatientSpecificDetailsToMap(user.getPatientSpecificDetails(), response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ROLE_DOCTOR/{id}")
    @PreAuthorize("(#id.toString() == authentication.name) and hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> getInfosForDoctor(@PathVariable Long id){
        User user = userService.getUserIfRegistered(id);
        Map<String, Object> response = new HashMap<>();
        userService.injectDoctorDetailsToMap(user.getDoctorDetails(), response);
        return ResponseEntity.ok(response);
    }
}
