package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.reqeusts.BasicUserInfoRegisterReq;
import com.sadi.pinklifeline.models.reqeusts.DocInfoRegReq;
import com.sadi.pinklifeline.models.reqeusts.PatientInfoRegisterReq;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.service.UserInfoRegistrationHandlerService;
import com.sadi.pinklifeline.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/infos")
public class UserInfoRegistrationHandlerV1 {
    private final Logger logger = LoggerFactory.getLogger(UserInfoRegistrationHandlerV1.class);

    private final UserInfoRegistrationHandlerService userInfoHandlerService;
    private final UserService userService;

    public UserInfoRegistrationHandlerV1(UserInfoRegistrationHandlerService userInfoHandlerService, UserService userService) {
        this.userInfoHandlerService = userInfoHandlerService;
        this.userService = userService;
    }

    @PostMapping("/ROLE_BASICUSER/{id}")
    @PreAuthorize("(#id.toString() == authentication.name) and hasRole('BASICUSER')")
    public ResponseEntity<Void> registerBasicUserInfo(@PathVariable Long id,
                                                    @Valid @RequestBody BasicUserInfoRegisterReq req){

        logger.debug("works basic {}", req.toString());
        User user = userService.getUserIfUnregistered(id);
        userInfoHandlerService.registerBasicUser(req,user);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ROLE_PATIENT/{id}")
    @PreAuthorize("(#id.toString() == authentication.name) and hasRole('PATIENT')")
    public ResponseEntity<Void> registerPatientUserInfo(@PathVariable Long id,
                                                      @Valid @RequestBody PatientInfoRegisterReq req){

        logger.debug("works patient {}", req.toString());
        User user = userService.getUserIfUnregistered(id);
        userInfoHandlerService.registerPatient(req,user);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ROLE_DOCTOR/{id}")
    @PreAuthorize("(#id.toString() == authentication.name) and hasRole('DOCTOR')")
    public ResponseEntity<Void> registerDoctorInfo(@PathVariable Long id,
                                                        @Valid @RequestBody DocInfoRegReq req){

        logger.debug("Doctor Registration {}", req.toString());
        User user = userService.getUserIfUnregistered(id);
        userInfoHandlerService.registerDoctor(req, user);

        return ResponseEntity.noContent().build();
    }
}
