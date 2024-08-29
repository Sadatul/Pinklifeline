package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.models.entities.RefreshToken;
import com.sadi.pinklifeline.repositories.RefreshTokenRepository;
import com.sadi.pinklifeline.utils.BasicUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${auth.jwt.refresh-token.timeout}")
    private int refreshTokenTimeout;

    public String getRefreshTokenForUser(Long userId) {
        String tokenValue = UUID.randomUUID().toString();
        RefreshToken refreshToken = new RefreshToken(userId, BasicUtils.generateSHA256Hash(tokenValue),
                Instant.now().plusSeconds(refreshTokenTimeout));
        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }

    public RefreshToken getRefreshTokenByToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(BasicUtils.generateSHA256Hash(token)).orElseThrow(
                () -> new BadCredentialsException("Invalid refresh token")
        );
        if (refreshToken.isExpired()) {
            throw new BadCredentialsException("Expired refresh token");
        }
        return refreshToken;
    }
}
