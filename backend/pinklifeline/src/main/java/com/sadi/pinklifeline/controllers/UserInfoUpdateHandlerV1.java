package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.BasicUserInfoUpdateReq;
import com.sadi.pinklifeline.models.reqeusts.DocInfoUpdateReq;
import com.sadi.pinklifeline.models.reqeusts.PatientInfoUpdateReq;
import com.sadi.pinklifeline.models.reqeusts.PeriodDataUpdateReq;
import com.sadi.pinklifeline.service.UserInfoUpdateHandlerService;
import com.sadi.pinklifeline.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/infos")
public class UserInfoUpdateHandlerV1 {
    private final UserInfoUpdateHandlerService updateHandlerService;
    private final UserService userService;

    private final Logger logger = LoggerFactory.getLogger(UserInfoUpdateHandlerV1.class);

    public UserInfoUpdateHandlerV1(UserInfoUpdateHandlerService updateHandlerService, UserService userService) {
        this.updateHandlerService = updateHandlerService;
        this.userService = userService;
    }

    @PutMapping("/profile_picture/{id}")
    @PreAuthorize("(#id.toString() == authentication.name)")
    public ResponseEntity<Void> updateProfilePicture(@PathVariable Long id, @Valid @RequestBody ProfilePictureUpdateReq req) {
        updateHandlerService.updateProfilePicture(id, req.getProfilePicture());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/period-data")
    @PreAuthorize("hasAnyRole('BASICUSER', 'PATIENT')")
    public ResponseEntity<Void> updatePeriodData(@Valid @RequestBody PeriodDataUpdateReq req) {
        updateHandlerService.updatePeriodData(req);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/ROLE_BASICUSER/{id}")
    @PreAuthorize("(#id.toString() == authentication.name) and hasRole('BASICUSER')")
    public ResponseEntity<Void> updateBasicUserInfo(@PathVariable Long id,
                                                      @Valid @RequestBody BasicUserInfoUpdateReq req){

        logger.debug("update basic {}", req.toString());
        User user = userService.getUserIfRegistered(id);
        updateHandlerService.updateBasicUser(req,user);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/ROLE_PATIENT/{id}")
    @PreAuthorize("(#id.toString() == authentication.name) and hasRole('PATIENT')")
    public ResponseEntity<Void> updatePatientUserInfo(@PathVariable Long id,
                                                        @Valid @RequestBody PatientInfoUpdateReq req){

        logger.debug("update patient {}", req.toString());
        User user = userService.getUserIfRegistered(id);
        updateHandlerService.updatePatient(req, user);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/ROLE_DOCTOR/{id}")
    @PreAuthorize("(#id.toString() == authentication.name) and hasRole('DOCTOR')")
    public ResponseEntity<Void> updateDoctorInfo(@PathVariable Long id,
                                                      @Valid @RequestBody DocInfoUpdateReq req){

        logger.debug("update doctor {}", req.toString());
        User user = userService.getUserIfRegistered(id);
        updateHandlerService.updateDoctorInfo(req, user);

        return ResponseEntity.noContent().build();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @ToString
    public static class ProfilePictureUpdateReq{
        @NotNull
        private String profilePicture;
    }
}
