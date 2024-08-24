package com.sadi.pinklifeline.utils;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

public class SecurityUtils {
    public static Long getOwnerID(){
        String owner = SecurityContextHolder.getContext().getAuthentication().getName();
        return Long.parseLong(owner);
    }

    public static Boolean isPaidAccount(){
        Jwt principal = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getClaimAsBoolean("paid");
    }


    public static Boolean hasRole(String role){
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream().anyMatch(r -> r.getAuthority().equals(role));
    }
}
