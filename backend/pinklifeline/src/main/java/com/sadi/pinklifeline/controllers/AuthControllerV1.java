package com.sadi.pinklifeline.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.sadi.pinklifeline.models.entities.RefreshToken;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.JwtTokenRequest;
import com.sadi.pinklifeline.models.reqeusts.RegistrationRequest;
import com.sadi.pinklifeline.models.reqeusts.ResetPasswordReq;
import com.sadi.pinklifeline.models.reqeusts.UserVerificationRequest;
import com.sadi.pinklifeline.models.responses.JwtTokenResponse;
import com.sadi.pinklifeline.service.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/v1/auth")
public class AuthControllerV1 {

    private final JwtTokenService jwtTokenService;
    private final AuthenticationManager authenticationManager;
    private final UserRegistrationAndVerificationService userRegVerService;

    private final Logger logger = LoggerFactory.getLogger(AuthControllerV1.class);
    private final RefreshTokenService refreshTokenService;
    private final ResetPasswordService resetPasswordService;

    @Value("${auth.jwt.timeout}")
    private int cookieExpiration;

    @Value("${auth.jwt.cookie.name}")
    private String cookieName;

    @Value("${auth.jwt.refresh-token.cookie-name}")
    private String refreshTokenCookieName;

    @Value("${auth.jwt.refresh-token.timeout}")
    private int refreshTokenTimeout;

    public AuthControllerV1(JwtTokenService jwtTokenService, AuthenticationManager authenticationManager,
                            UserRegistrationAndVerificationService userRegVerService, RefreshTokenService refreshTokenService, ResetPasswordService resetPasswordService) {
        this.jwtTokenService = jwtTokenService;
        this.authenticationManager = authenticationManager;
        this.userRegVerService = userRegVerService;
        this.refreshTokenService = refreshTokenService;
        this.resetPasswordService = resetPasswordService;
    }

    @PostMapping
    public ResponseEntity<JwtTokenResponse> generateToken(@Valid @RequestBody JwtTokenRequest tokenRequest, HttpServletResponse response) {
        var authenticationToken = new UsernamePasswordAuthenticationToken(tokenRequest.getUsername(), tokenRequest.getPassword());
        var authentication = authenticationManager.authenticate(authenticationToken);
        var tokenResponse = jwtTokenService.generateToken(authentication);
        Cookie cookie = new Cookie(cookieName, tokenResponse.token());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(cookieExpiration); // 7 days
        response.addCookie(cookie);

        Cookie refreshCookie = new Cookie(refreshTokenCookieName, tokenResponse.refreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(refreshTokenTimeout);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok(tokenResponse);
    }

    @GetMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        // Create a cookie with the same name, but with maxAge=0
        logger.debug("Logout request received");

        Cookie cookie = new Cookie(cookieName, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // 7 days
        response.addCookie(cookie);

        Cookie refreshCookie = new Cookie(refreshTokenCookieName, "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);
        return ResponseEntity.ok("Logout successful");
    }

    @PostMapping("/register")
    @PreAuthorize("#registrationRequest.role.toString() != 'ROLE_ADMIN'")
    public ResponseEntity<Void> register(@Valid @RequestBody RegistrationRequest registrationRequest) throws JsonProcessingException {
        userRegVerService.checkIfUserExists(registrationRequest.getUsername());
        logger.debug("Registered user with email={}", registrationRequest.getUsername());
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

    @GetMapping("/refresh")
    public ResponseEntity<Map<String, Object>> accessTokenRefresh(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();

        if(cookies == null) {
            throw new BadCredentialsException("No Cookie found");
        }

        Optional<Cookie> refreshTokenCookie = Arrays.stream(cookies).filter(c -> c.getName()
                        .equalsIgnoreCase(refreshTokenCookieName))
                        .findFirst();

        if(refreshTokenCookie.isEmpty()){
            throw new BadCredentialsException("No Cookie found");
        }
        String tokenVal = refreshTokenCookie.get().getValue();
        RefreshToken refreshToken = refreshTokenService.getRefreshTokenByToken(tokenVal);
        String token = jwtTokenService.getJwtTokenFromUserId(refreshToken.getUserId());

        Cookie cookie = new Cookie(cookieName, token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(cookieExpiration); // 7 days
        response.addCookie(cookie);

        return ResponseEntity.ok(Collections.singletonMap("token", token));
    }

    @GetMapping("/reset-password")
    public ResponseEntity<Void> resetPasswordRequest(@RequestParam String email) {
        resetPasswordService.validateUsername(email);
        String token = resetPasswordService.generateToken();
        resetPasswordService.putPasswordToken(email, resetPasswordService.getHashedToken(token));
        resetPasswordService.sendResetMail(email, token);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordReq req) {
        resetPasswordService.resetPassword(req.getEmail(), req.getPassword(), req.getToken());
        resetPasswordService.deleteRefreshTokens(req.getEmail());
        return ResponseEntity.noContent().build();
    }
}
