package com.sadi.pinklifeline.utils;

import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

public class SecurityUtils {
    public static Long getOwnerID(){
        String owner = SecurityContextHolder.getContext().getAuthentication().getName();
        return Long.parseLong(owner);
    }

    public static Boolean isSubscribedAccount(){
        Jwt principal = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getClaimAsBoolean("subscribed");
    }

    public static void throwExceptionIfNotSubscribed(){
        if(!isSubscribedAccount()){
            throw new AuthorizationDeniedException(
                    "User needs a subscribed account to access this feature", () -> false);
        }
    }

    public static Boolean hasRole(String role){
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream().anyMatch(r -> r.getAuthority().equals(role));
    }
}
