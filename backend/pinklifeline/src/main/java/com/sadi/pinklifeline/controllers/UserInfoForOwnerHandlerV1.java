package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.service.UserService;
import com.sadi.pinklifeline.utils.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
