package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.exceptions.UserInfoUnregisteredException;
import com.sadi.pinklifeline.models.responses.NearbyUserRes;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.repositories.UserRepository;
import com.uber.h3core.H3Core;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class PatientSpecificFeaturesService {
    private final UserRepository userRepository;
    private final UserService userService;
    private final H3Core h3;
    @Value("${nearbypatients.h3.grid.size}")
    private int gridSize;

    public PatientSpecificFeaturesService(UserRepository userRepository, UserService userService) throws IOException {
        this.userRepository = userRepository;
        this.userService = userService;
        h3 = H3Core.newInstance();
    }

    @PreAuthorize("#id.toString() == authentication.name and hasRole('PATIENT')")
    public List<NearbyUserRes> getNearbyUsers(Long id){
        User user = userService.getUserIfRegistered(id);
        List<String> nearByCells = h3.gridDisk(user.getPatientSpecificDetails().getLocation(), gridSize);
        return userRepository.findNearbyUsers(nearByCells, id);
    }
}
