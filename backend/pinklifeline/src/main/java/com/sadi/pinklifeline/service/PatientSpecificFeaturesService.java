package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.models.entities.PatientSpecificDetails;
import com.sadi.pinklifeline.models.responses.NearbyUserRes;
import com.sadi.pinklifeline.repositories.PatientSpecificDetailsRepository;
import com.sadi.pinklifeline.repositories.UserRepository;
import com.sadi.pinklifeline.utils.SecurityUtils;
import com.uber.h3core.H3Core;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class PatientSpecificFeaturesService {
    private final UserRepository userRepository;
    private final H3Core h3;
    private final PatientSpecificDetailsRepository patientSpecificDetailsRepository;
    @Value("${nearbypatients.h3.grid.size}")
    private int gridSize;

    public PatientSpecificFeaturesService(UserRepository userRepository, PatientSpecificDetailsRepository patientSpecificDetailsRepository) throws IOException {
        this.userRepository = userRepository;
        h3 = H3Core.newInstance();
        this.patientSpecificDetailsRepository = patientSpecificDetailsRepository;
    }

    @PreAuthorize("#id.toString() == authentication.name and hasRole('PATIENT')")
    public List<NearbyUserRes> getNearbyUsers(Long id){
        PatientSpecificDetails patient = getPatient(id);
        List<String> nearByCells = h3.gridDisk(patient.getLocation(), gridSize);
        return userRepository.findNearbyUsers(nearByCells, id);
    }

    @PreAuthorize("hasRole('PATIENT')")
    public Boolean updatePatientLocationShare() {
        Long userId = SecurityUtils.getOwnerID();
        PatientSpecificDetails patient = getPatient(userId);
        Boolean status = patient.getLocationShare();
        patient.setLocationShare(!status);
        patientSpecificDetailsRepository.save(patient);
        return !status;
    }

    public PatientSpecificDetails getPatient(Long id) {
        return patientSpecificDetailsRepository.findById(id).orElseThrow(() -> new BadRequestFromUserException(
                "User needs to register his information first"
            )
        );
    }
}
