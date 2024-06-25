package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.repositories.UserRepository;
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
    private final UserRepository userRepository;

    private final Logger logger = LoggerFactory.getLogger(UserInfoUpdateHandlerV1.class);

    public UserInfoUpdateHandlerV1(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/profile_picture/{id}")
    @PreAuthorize("(#id.toString() == authentication.name)")
    public ResponseEntity<Void> updateProfilePicture(@PathVariable Long id, @Valid @RequestBody ProfilePictureUpdateReq req) {
        userRepository.updateProfilePictureById(id, req.getProfilePicture());
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
