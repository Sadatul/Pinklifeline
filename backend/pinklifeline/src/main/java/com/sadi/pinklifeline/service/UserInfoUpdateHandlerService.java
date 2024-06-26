package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.exceptions.UserInfoUnregisteredException;
import com.sadi.pinklifeline.models.*;
import com.sadi.pinklifeline.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
public class UserInfoUpdateHandlerService {

    private final UserRepository userRepository;
    Logger logger = LoggerFactory.getLogger(UserInfoUpdateHandlerService.class);

    public UserInfoUpdateHandlerService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private BasicUserDetails getBasicUserDetails(AbstractUserInfoUpdateReq req, User user) {
        BasicUserDetails basic = user.getBasicUser();
        basic.setHeight(req.getHeight());
        basic.setWeight(req.getWeight());
        basic.setCancerHistory(req.getCancerHistory());
        basic.setCancerRelatives(req.getCancerRelatives());
        basic.setLastPeriodDate(req.getLastPeriodDate());
        basic.setAvgCycleLength(req.getAvgCycleLength());
        basic.setMedications(req.getMedications());
        basic.setAllergies(req.getAllergies());
        basic.setFullName(req.getFullName());
        basic.setOrgansWithChronicCondition(req.getOrgansWithChronicCondition());
        basic.setPeriodIrregularities(req.getPeriodIrregularities());
        return basic;
    }

    private PatientSpecificDetails getPatientSpecificDetails(PatientInfoUpdateReq req, User user) {
        PatientSpecificDetails patientSpecificDetails = user.getPatientSpecificDetails();
        patientSpecificDetails.setCancerStage(req.getCancerStage());
        patientSpecificDetails.setDiagnosisDate(req.getDiagnosisDate());
        return patientSpecificDetails;
    }

    public User getUserForInfoUpdate(Long id){
        User user = userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if(user.getIsRegistrationComplete().equals(YesNo.N)){
            throw new UserInfoUnregisteredException("User needs to complete registration");
        }

        return user;
    }

    public void updateBasicUser(BasicUserInfoUpdateReq req, User user) {
        BasicUserDetails basic = getBasicUserDetails(req, user);
        user.setBasicUser(basic);
        try{
            userRepository.save(user);
        }
        catch (UnsupportedOperationException e){
            logger.info("This error is thrown basic update {}",e.toString());
        }
    }

    public void updatePatient(PatientInfoUpdateReq req, User user){
        BasicUserDetails basic = getBasicUserDetails(req, user);
        PatientSpecificDetails patientSpecific = getPatientSpecificDetails(req, user);
        user.setBasicUser(basic);
        user.setPatientSpecificDetails(patientSpecific);
        try{
            userRepository.save(user);
        }
        catch (UnsupportedOperationException e){
            logger.info("This error is thrown patient update {}",e.toString());
        }
    }
}
