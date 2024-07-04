package com.sadi.pinklifeline.services;

import com.sadi.pinklifeline.repositories.UserRepository;
import com.sadi.pinklifeline.service.UserService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.mockito.BDDMockito.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    public void unknownUser_getUser_ThrowsException(){
        given(userRepository.findById(2L)).willReturn(Optional.empty());
        Assertions.assertThrows(UsernameNotFoundException.class, () -> userService.getUser(2L));
    }
}
