package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.models.dtos.UserTokenDTO;
import com.sadi.pinklifeline.models.responses.JwtTokenResponse;
import com.sadi.pinklifeline.repositories.DoctorDetailsRepository;
import com.sadi.pinklifeline.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JwtTokenService {
    private final JwtEncoder jwtEncoder;
    private final DoctorDetailsRepository doctorDetailsRepository;

    @Value("${auth.jwt.audiences}")
    private String[] audiences;

    @Value("${auth.jwt.timeout}")
    private int timeout;

    @Value("${auth.jwt.issuer}")
    private String issuer;
    private final UserRepository userRepository;

    public JwtTokenService(JwtEncoder jwtEncoder,
                           UserRepository userRepository, DoctorDetailsRepository doctorDetailsRepository) {
        this.jwtEncoder = jwtEncoder;
        this.userRepository = userRepository;
        this.doctorDetailsRepository = doctorDetailsRepository;
    }

    public JwtTokenResponse generateToken(Authentication authentication) {
        var scope = authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.joining(" "));
        UserTokenDTO user = userRepository.findUserTokenDTOByUsername(authentication.getName())
                    .orElseThrow(() -> new UsernameNotFoundException("Username not found"));
        user.setRoles(userRepository.getRolesById(user.getId()));
        int subscribed = (user.getExpiryDate() != null && LocalDateTime.now().isBefore(user.getExpiryDate()))
                ? user.getSubscriptionType().getValue() : 0;
        boolean isVerified = doctorDetailsRepository.existsByUserIdAndAndIsVerified(user.getId(), YesNo.Y);
        var claims = JwtClaimsSet.builder()
                                .issuer(issuer)
                                .issuedAt(Instant.now())
                                .audience(List.of(audiences))
                                .expiresAt(Instant.now().plusSeconds(timeout))
                                .subject(user.getId().toString())
                                .claim("scp", scope)
                                .claim("subscribed", subscribed)
                                .build();
        String token = this.jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
        return new JwtTokenResponse(token, user.getId(), user.getUsername(),
                user.getIsRegistered().equals(YesNo.Y), isVerified, subscribed, user.getRoles());
    }
}