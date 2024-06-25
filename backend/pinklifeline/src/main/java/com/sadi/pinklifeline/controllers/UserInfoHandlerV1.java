package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.BasicUserInfoRegisterReq;
import com.sadi.pinklifeline.models.PatientInfoRegisterReq;
import com.sadi.pinklifeline.models.User;
import com.sadi.pinklifeline.service.UserInfoHandlerService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1")
public class UserInfoHandlerV1 {
    private final Logger logger = LoggerFactory.getLogger(UserInfoHandlerV1.class);

    private final UserInfoHandlerService userInfoHandlerService;

    public UserInfoHandlerV1(UserInfoHandlerService userInfoHandlerService) {
        this.userInfoHandlerService = userInfoHandlerService;
    }

    @PostMapping("/ROLE_BASICUSER/register/{id}")
    @PreAuthorize("(#id.toString() == authentication.name) and hasRole('BASICUSER')")
    public ResponseEntity<Void> registerBasicUserInfo(@PathVariable Long id,
                                                    @Valid @RequestBody BasicUserInfoRegisterReq req){

        logger.info("works basic {}", req.toString());
        User user = userInfoHandlerService.getUserForInfoRegistration(id);
        userInfoHandlerService.registerBasicUser(req,user);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ROLE_PATIENT/register/{id}")
    @PreAuthorize("(#id.toString() == authentication.name) and hasRole('PATIENT')")
    public ResponseEntity<Void> registerPatientUserInfo(@PathVariable Long id,
                                                      @Valid @RequestBody PatientInfoRegisterReq req){

        logger.info("works patient {}", req.toString());
        User user = userInfoHandlerService.getUserForInfoRegistration(id);
        userInfoHandlerService.registerPatient(req,user);

        return ResponseEntity.noContent().build();
    }
}
