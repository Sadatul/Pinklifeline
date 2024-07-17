package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.responses.PatientResForeign;
import com.sadi.pinklifeline.service.UserService;
import com.sadi.pinklifeline.service.doctor.DoctorsInfoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/v1/infos/guest")
public class UserInfoForGuestHandlerV1 {
    private final DoctorsInfoService doctorsInfoService;
    private final UserService userService;

    public UserInfoForGuestHandlerV1(DoctorsInfoService doctorsInfoService, UserService userService) {
        this.doctorsInfoService = doctorsInfoService;
        this.userService = userService;
    }

    @GetMapping("/doctor/{id}")
    public ResponseEntity<Map<String, Object>> getDoctorInfos(@PathVariable Long id){
        DoctorDetails doctorDetails = doctorsInfoService.getDoctor(id);
        String profilePic = userService.getProfilePicture(id);
        Map<String, Object> response = new HashMap<>();
        response.put("fullName", doctorDetails.getFullName());
        response.put("qualifications", doctorDetails.getQualifications());
        response.put("profilePicture", profilePic);
        response.put("workplace", doctorDetails.getWorkplace());
        response.put("department", doctorDetails.getDepartment());
        response.put("designation", doctorDetails.getDesignation());
        response.put("isVerified", doctorDetails.getIsVerified());
        response.put("contactNumber", doctorDetails.getContactNumber());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/basic/{id}")
    public ResponseEntity<Map<String, Object>> getPatientInfo(@PathVariable Long id){
        User user = userService.getUserIfRegistered(id);
        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("profilePicture", user.getProfilePicture());
        response.put("roles", user.getRoles());
        response.put("fullName", user.getBasicUser().getFullName());

        if(user.getRoles().contains(Roles.ROLE_PATIENT)){
            PatientResForeign res = userService.getPatientResForeign(id);
            response.put("cancerStage", res.getCancerStage());
            response.put("diagnosisDate", res.getDiagnosisDate());
        }
        return ResponseEntity.ok(response);
    }
}
