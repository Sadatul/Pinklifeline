package com.sadi.pinklifeline.configs;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.time.Instant;

@Slf4j
public class CustomChannelInterceptor implements ChannelInterceptor {
    private final JwtDecoder jwtDecoder;

    public CustomChannelInterceptor(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;

    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        log.info("Header {}", accessor);
        assert accessor != null;
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");
            if(token == null || !token.startsWith("Bearer ")) {
                throw new JwtException("Invalid token");
            }
            Jwt jwt = jwtDecoder.decode(token.substring(7));
            if(jwt.getExpiresAt() == null){
                throw new JwtException("Invalid JWT token");
            }
            if(jwt.getExpiresAt().isBefore(Instant.now())){
                throw new JwtException("Expired JWT token");
            }
            var auth = new JwtAuthenticationToken(jwt);
            auth.setAuthenticated(true);
            accessor.setUser(auth);
        }
        return message;
    }
}
