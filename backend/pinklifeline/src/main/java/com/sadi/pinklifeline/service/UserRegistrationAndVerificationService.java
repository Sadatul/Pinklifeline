package com.sadi.pinklifeline.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.sadi.pinklifeline.controllers.AuthControllerV1;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.exceptions.OtpMismatchException;
import com.sadi.pinklifeline.exceptions.OtpTimedOutException;
import com.sadi.pinklifeline.exceptions.UserAlreadyExistsException;
import com.sadi.pinklifeline.models.UnverifiedUser;
import com.sadi.pinklifeline.models.User;
import com.sadi.pinklifeline.repositories.UserRepository;
import com.sadi.pinklifeline.repositories.UserVerificationRepository;
import com.sadi.pinklifeline.utils.CodeGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserRegistrationAndVerificationService {
    @Value("${verification.email.message}")
    private String verificationEmailMessage;

    @Value("${verification.email.subject}")
    private String verificationEmailSubject;

    @Value("${verification.email.timeout}")
    private Long optExpiration;

    private final Logger logger = LoggerFactory.getLogger(AuthControllerV1.class);
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final UserVerificationRepository userVerRepo;

    public UserRegistrationAndVerificationService(PasswordEncoder passwordEncoder,
                                                  EmailService emailService,
                                                  UserRepository userRepository,
                                                  UserVerificationRepository userVerRepo) {
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.userVerRepo = userVerRepo;
    }
    public void checkIfUserExists(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent()) {
            throw new UserAlreadyExistsException(String.format("User with email=%s already exists", username));
        }

    }
    public void cacheDetails(String username, String password, Roles role, String otp) throws JsonProcessingException {
        UnverifiedUser unverifiedUser = new UnverifiedUser(new User(username,
                passwordEncoder.encode(password),
                List.of(role)), otp);

        userVerRepo.putUserVerificationInfo(username, unverifiedUser);
    }

    public void sendVerificationEmail(String username, String otp) {
        int minutes = Integer.parseInt(optExpiration.toString()) / 60;
        emailService.sendSimpleEmail(username, verificationEmailSubject,
                String.format(verificationEmailMessage, otp, minutes));
    }

    public String getOtp(){
        return CodeGenerator.generateOtp();
    }

    public User verifyUser(String username, String otp) throws JsonProcessingException {
        Optional<UnverifiedUser> unverifiedUser = userVerRepo.getUserVerificationInfoByUsername(username);

        if (unverifiedUser.isEmpty()) {
            throw new OtpTimedOutException("Your opt has timed out");
        }

        if(!unverifiedUser.get().getOtp().equals(otp)){
            throw new OtpMismatchException("Your OTP doesn't match. Please try again");
        }
        return unverifiedUser.get().getUser();
    }

    public void saveUser(User user) {
        userVerRepo.deleteUserVerInfoByUsername(user.getUsername());
        userRepository.save(user);
    }
}
