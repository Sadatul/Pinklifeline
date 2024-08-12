package com.sadi.pinklifeline.models.responses;

import com.sadi.pinklifeline.enums.Roles;

import java.util.List;

public record JwtTokenResponse(String token, Long userId, String username, List<Roles> roles) {
}
