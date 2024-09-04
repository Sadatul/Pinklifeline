package com.sadi.pinklifeline.models.responses;

import com.sadi.pinklifeline.enums.Roles;

import java.util.List;

public record JwtTokenResponse(String token, String refreshToken, Long userId, String username, boolean isRegistered, boolean isVerified, Integer subscribed, List<Roles> roles) {
}
