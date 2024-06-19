package com.sadi.pinklifeline.services;

import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.exceptions.UserAlreadyExistsException;
import com.sadi.pinklifeline.models.User;
import com.sadi.pinklifeline.repositories.UserRepository;
import com.sadi.pinklifeline.repositories.UserVerificationRepository;
import com.sadi.pinklifeline.service.UserRegistrationAndVerificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
public class UserRegistrationAndVerificationServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private UserVerificationRepository userVerRepo;

    @InjectMocks
    private UserRegistrationAndVerificationService userRegVerService;

    @Value("${verification.email.redis.prefix}")
    private String redisPrefix;

    @Test
    public void user_checkIfUserExist_throwsException() {
        User user = new User(1L, "sadatulislamsadi@gmail.com", "1234", List.of(Roles.ROLE_PATIENT));

        given(userRepository.findByUsername(user.getUsername())).willReturn(Optional.of(user));

        assertThrows(UserAlreadyExistsException.class, () -> userRegVerService.checkIfUserExists(user.getUsername()));
    }

    @Test
    public void getOtpTest(){
        String otp = userRegVerService.getOtp();

        assertEquals(6, otp.length());
    }

    @Test
    public void givenUser_saveUserTest(){
        System.out.println(redisPrefix);
        User user = new User(1L, "sadatulislamsadi@gmail.com", "1234", List.of(Roles.ROLE_PATIENT));

        given(userRepository.save(user)).willReturn(user);
        willDoNothing().given(userVerRepo).deleteUserVerInfoByUsername(user.getUsername());

        userRegVerService.saveUser(user);

        verify(userRepository, times(1)).save(user);
        verify(userVerRepo, times(1)).deleteUserVerInfoByUsername(user.getUsername());
    }
}
