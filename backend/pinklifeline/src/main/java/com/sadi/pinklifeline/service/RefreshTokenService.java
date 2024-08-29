package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.models.entities.RefreshToken;
import com.sadi.pinklifeline.repositories.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${auth.jwt.refresh-token.timeout}")
    private int refreshTokenTimeout;

    public RefreshToken getRefreshTokenForUser(Long userId) {
        Optional<RefreshToken> optionalRefreshToken = refreshTokenRepository.findById(userId);
        if (optionalRefreshToken.isPresent() && !optionalRefreshToken.get().isExpired()) {
            return optionalRefreshToken.get();
        }

        RefreshToken refreshToken = new RefreshToken(userId, Instant.now().plusSeconds(refreshTokenTimeout));
        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken getRefreshTokenByToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token).orElseThrow(
                () -> new BadCredentialsException("Invalid refresh token")
        );
        if (refreshToken.isExpired()) {
            throw new BadCredentialsException("Expired refresh token");
        }
        return refreshToken;
    }
}
