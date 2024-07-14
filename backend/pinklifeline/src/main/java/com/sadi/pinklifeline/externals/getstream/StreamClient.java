package com.sadi.pinklifeline.externals.getstream;

import com.sadi.pinklifeline.utils.SecurityUtils;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.HashMap;
import java.util.Map;

@Component
public class StreamClient {
    private final String apiKey;
    private final String apiSecret;

    @Value("${getstream.user.token.expiration}")
    private Long tokenExpiration;

    public StreamClient(@Value("${GETSTREAM_API_KEY}") String apiKey,
                        @Value("${GETSTREAM_API_SECRET}") String apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    public String generateToken(Map<String, Object> payload){
        Key key = Keys.hmacShaKeyFor(apiSecret.getBytes());

        var jwtBuilder = Jwts.builder()
                .setHeaderParam("alg", "HS256")
                .setClaims(payload);

        if (!payload.containsKey("iat")) {
            jwtBuilder.setIssuedAt(null);
        }

        return jwtBuilder.signWith(key, SignatureAlgorithm.HS256).compact();
    }

    public String getUserToken(){
        Long owner = SecurityUtils.getOwnerID();
        Map<String, Object> payload = new HashMap<>();
        payload.put("user_id", owner.toString());
        payload.put("exp", System.currentTimeMillis() / 1000 + tokenExpiration);
        payload.put("iat", System.currentTimeMillis() / 1000);
        return generateToken(payload);
    }
}
