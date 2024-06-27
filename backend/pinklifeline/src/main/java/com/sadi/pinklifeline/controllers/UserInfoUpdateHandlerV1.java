package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.BasicUserInfoUpdateReq;
import com.sadi.pinklifeline.models.reqeusts.PatientInfoUpdateReq;
import com.sadi.pinklifeline.repositories.UserRepository;
import com.sadi.pinklifeline.service.UserInfoUpdateHandlerService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/update")
public class UserInfoUpdateHandlerV1 {
    private final UserInfoUpdateHandlerService updateHandlerService;
    private final UserRepository userRepository;

    private final Logger logger = LoggerFactory.getLogger(UserInfoUpdateHandlerV1.class);

    public UserInfoUpdateHandlerV1(UserInfoUpdateHandlerService updateHandlerService, UserRepository userRepository) {
        this.updateHandlerService = updateHandlerService;
        this.userRepository = userRepository;
    }

    @PostMapping("/profile_picture/{id}")
    @PreAuthorize("(#id.toString() == authentication.name)")
    public ResponseEntity<Void> updateProfilePicture(@PathVariable Long id, @Valid @RequestBody ProfilePictureUpdateReq req) {
        userRepository.updateProfilePictureById(id, req.getProfilePicture());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ROLE_BASICUSER/{id}")
    @PreAuthorize("(#id.toString() == authentication.name) and hasRole('BASICUSER')")
    public ResponseEntity<Void> updateBasicUserInfo(@PathVariable Long id,
                                                      @Valid @RequestBody BasicUserInfoUpdateReq req){

        logger.info("update basic {}", req.toString());
        User user = updateHandlerService.getUserForInfoUpdate(id);
        updateHandlerService.updateBasicUser(req,user);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ROLE_PATIENT/{id}")
    @PreAuthorize("(#id.toString() == authentication.name) and hasRole('PATIENT')")
    public ResponseEntity<Void> updatePatientUserInfo(@PathVariable Long id,
                                                        @Valid @RequestBody PatientInfoUpdateReq req){

        logger.info("update patient {}", req.toString());
        User user = updateHandlerService.getUserForInfoUpdate(id);
        updateHandlerService.updatePatient(req, user);

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
