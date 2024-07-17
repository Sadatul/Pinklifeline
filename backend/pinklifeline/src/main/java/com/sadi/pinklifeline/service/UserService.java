package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.exceptions.UserInfoUnregisteredException;
import com.sadi.pinklifeline.exceptions.UserRegistrationAlreadyCompleteException;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.responses.PatientResForeign;
import com.sadi.pinklifeline.repositories.PatientSpecificDetailsRepository;
import com.sadi.pinklifeline.repositories.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PatientSpecificDetailsRepository patientSpecificDetailsRepository;

    public UserService(UserRepository userRepository, PatientSpecificDetailsRepository patientSpecificDetailsRepository) {
        this.userRepository = userRepository;
        this.patientSpecificDetailsRepository = patientSpecificDetailsRepository;
    }

    public User getUser(Long id){
        return userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
    public User getUserWithIdAndRegistrationStatus(Long id){
        return userRepository.findByIdWithIsRegistrationComplete(id).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
    public String getProfilePicture(Long id){
        return userRepository.getProfilePictureById(id);
    }

    public User getUserIfRegistered(Long id){
        User user = getUser(id);
        if(user.getIsRegistrationComplete() == YesNo.N){
            throw new UserInfoUnregisteredException("User needs to register his information first");
        }
        return user;
    }

    public User getUserIfRegisteredOnlyId(Long id){
        User user = getUserWithIdAndRegistrationStatus(id);
        if(user.getIsRegistrationComplete() == YesNo.N){
            throw new UserInfoUnregisteredException("User needs to register his information first");
        }
        return user;
    }

    public User getUserIfUnregistered(Long id){
        User user = getUser(id);
        if(user.getIsRegistrationComplete().equals(YesNo.Y)){
            throw new UserRegistrationAlreadyCompleteException("User Registration has been Completed before");
        }

        return user;
    }
    public PatientResForeign getPatientResForeign(Long id){
        return patientSpecificDetailsRepository.findByPatientByUserIdForeign(id).orElseThrow(
                () -> new UserInfoUnregisteredException(String.format("Patient with id:%d hasn't registered yet", id))
        );
    }
}
