package com.sadi.pinklifeline.services;

import com.sadi.pinklifeline.repositories.UserRepository;
import com.sadi.pinklifeline.service.PatientSpecificFeaturesService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class PatientSpecificFeaturesServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PatientSpecificFeaturesService patientService;

    @Test
    public void unknownUser_getUser_ThrowsException(){
        given(userRepository.findById(2L)).willReturn(Optional.empty());
        Assertions.assertThrows(UsernameNotFoundException.class, () -> patientService.getUser(2L));
    }
}
