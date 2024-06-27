package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.exceptions.UserInfoUnregisteredException;
import com.sadi.pinklifeline.models.NearbyUserRes;
import com.sadi.pinklifeline.models.User;
import com.sadi.pinklifeline.repositories.UserRepository;
import com.uber.h3core.H3Core;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class PatientSpecificFeaturesService {
    private final UserRepository userRepository;
    private final H3Core h3;

    public PatientSpecificFeaturesService(UserRepository userRepository) throws IOException {
        this.userRepository = userRepository;
        h3 = H3Core.newInstance();
    }
    public User getUser(Long id){
        User user = userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if(user.getIsRegistrationComplete() == YesNo.N){
            throw new UserInfoUnregisteredException("User needs to register his information first");
        }
        return user;
    }

    @PreAuthorize("#id.toString() == authentication.name and hasRole('PATIENT')")
    public List<NearbyUserRes> getNearbyUsers(Long id){
        User user = getUser(id);
        List<String> nearByCells = h3.gridDisk(user.getPatientSpecificDetails().getLocation(), 1);
        return userRepository.findNearbyUsers(nearByCells, id);
    }
}
