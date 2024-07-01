package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.exceptions.UserInfoUnregisteredException;
import com.sadi.pinklifeline.exceptions.UserRegistrationAlreadyCompleteException;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.repositories.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUser(Long id){
        return userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public User getUserIfRegistered(Long id){
        User user = getUser(id);
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
}
