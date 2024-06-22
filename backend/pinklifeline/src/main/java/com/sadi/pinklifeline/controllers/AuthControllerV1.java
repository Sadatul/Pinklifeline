package com.sadi.pinklifeline.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.sadi.pinklifeline.models.*;
import com.sadi.pinklifeline.service.JwtTokenService;
import com.sadi.pinklifeline.service.UserRegistrationAndVerificationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
public class AuthControllerV1 {

    private final JwtTokenService jwtTokenService;
    private final AuthenticationManager authenticationManager;
    private final UserRegistrationAndVerificationService userRegVerService;

    private final Logger logger = LoggerFactory.getLogger(AuthControllerV1.class);


    public AuthControllerV1(JwtTokenService jwtTokenService, AuthenticationManager authenticationManager,
                            UserRegistrationAndVerificationService userRegVerService) {
        this.jwtTokenService = jwtTokenService;
        this.authenticationManager = authenticationManager;
        this.userRegVerService = userRegVerService;
    }

    @PostMapping
    public ResponseEntity<JwtTokenResponse> generateToken(@Valid @RequestBody JwtTokenRequest tokenRequest) {
        var authenticationToken = new UsernamePasswordAuthenticationToken(tokenRequest.getUsername(), tokenRequest.getPassword());
        var authentication = authenticationManager.authenticate(authenticationToken);
        var token = jwtTokenService.generateToken(authentication);
        return ResponseEntity.ok(new JwtTokenResponse(token));
    }

    @PostMapping("/register")
    @PreAuthorize("#registrationRequest.role.toString() != 'ROLE_ADMIN'")
    public ResponseEntity<Void> register(@Valid @RequestBody RegistrationRequest registrationRequest) throws JsonProcessingException {
        userRegVerService.checkIfUserExists(registrationRequest.getUsername());
        logger.debug(String.format("Registered user with email=%s", registrationRequest.getUsername()));
        String otp = userRegVerService.getOtp();

        userRegVerService.cacheDetails(registrationRequest.getUsername(),
                registrationRequest.getPassword(), registrationRequest.getRole(), otp);

        userRegVerService.sendVerificationEmail(registrationRequest.getUsername(), otp);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify")
    public ResponseEntity<Void> verifyOpt(@RequestBody UserVerificationRequest request) throws JsonProcessingException {
        User user = userRegVerService.verifyUser(request.getUsername(), request.getOtp());
        userRegVerService.saveUser(user);
        return ResponseEntity.ok().build();
    }
}
