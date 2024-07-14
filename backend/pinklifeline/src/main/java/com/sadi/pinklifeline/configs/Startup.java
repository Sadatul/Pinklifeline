package com.sadi.pinklifeline.configs;

import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

@Configuration
public class Startup {
    @Value("${ADMIN_USERNAME}")
    private String adminUsername;

    @Value("${ADMIN_PASSWORD}")
    private String adminPassword;


    @Bean
    public CommandLineRunner commandLineRunner(UserRepository userRepository,
                                               PasswordEncoder passwordEncoder) {
        return args -> {
            Optional<Long> user = userRepository.findByUsernameOnlyId(adminUsername);
            if(user.isEmpty()){
                userRepository.save(new User(adminUsername, passwordEncoder.encode(adminPassword),
                        List.of(Roles.ROLE_ADMIN)));
            }
        };
    }
}
