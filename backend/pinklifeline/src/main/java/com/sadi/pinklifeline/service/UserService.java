package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.exceptions.UserInfoUnregisteredException;
import com.sadi.pinklifeline.exceptions.UserRegistrationAlreadyCompleteException;
import com.sadi.pinklifeline.models.entities.BasicUserDetails;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.entities.PatientSpecificDetails;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.responses.PatientResForeign;
import com.sadi.pinklifeline.repositories.PatientSpecificDetailsRepository;
import com.sadi.pinklifeline.repositories.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Map;

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

    public String getUsernameById(Long id){
        return userRepository.findUsernameById(id).orElseThrow(() -> new UsernameNotFoundException("User not found"));
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

    public void injectBasicUserDetailsToMap(BasicUserDetails basicUserDetails, Map<String, Object> response) {
        response.put("fullName", basicUserDetails.getFullName());
        response.put("dob", basicUserDetails.getDob());
        response.put("height", basicUserDetails.getHeight());
        response.put("weight", basicUserDetails.getWeight());
        response.put("cancerHistory", basicUserDetails.getCancerHistory());
        response.put("cancerRelatives", basicUserDetails.getCancerRelatives());
        response.put("lastPeriodDate", basicUserDetails.getLastPeriodDate());
        response.put("avgCycleLength", basicUserDetails.getAvgCycleLength());
        response.put("periodIrregularities", basicUserDetails.getPeriodIrregularities());
        response.put("allergies", basicUserDetails.getAllergies());
        response.put("organsWithChronicCondition", basicUserDetails.getOrgansWithChronicCondition());
        response.put("medications", basicUserDetails.getMedications());
    }

    public void injectPatientSpecificDetailsToMap(PatientSpecificDetails patient, Map<String, Object> response) {
        response.put("cancerStage", patient.getCancerStage());
        response.put("diagnosisDate", patient.getDiagnosisDate());
        response.put("location", patient.getLocation());
        response.put("locationShare", patient.getLocationShare());
    }

    public void injectDoctorDetailsToMap(DoctorDetails doctorDetails, Map<String, Object> response){
        response.put("fullName", doctorDetails.getFullName());
        response.put("registrationNumber", doctorDetails.getRegistrationNumber());
        response.put("qualifications", doctorDetails.getQualifications());
        response.put("workplace", doctorDetails.getWorkplace());
        response.put("department", doctorDetails.getDepartment());
        response.put("designation", doctorDetails.getDesignation());
        response.put("contactNumber", doctorDetails.getContactNumber());
        response.put("isVerified", doctorDetails.getIsVerified());
    }
}
