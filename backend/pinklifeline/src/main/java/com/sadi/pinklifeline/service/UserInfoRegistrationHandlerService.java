package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.models.entities.BasicUserDetails;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.entities.PatientSpecificDetails;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.AbstractUserInfoRegisterReq;
import com.sadi.pinklifeline.models.reqeusts.BasicUserInfoRegisterReq;
import com.sadi.pinklifeline.models.reqeusts.DocInfoRegReq;
import com.sadi.pinklifeline.models.reqeusts.PatientInfoRegisterReq;
import com.sadi.pinklifeline.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class UserInfoRegistrationHandlerService {

    private final UserRepository userRepository;
    public UserInfoRegistrationHandlerService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    Logger logger = LoggerFactory.getLogger(UserInfoRegistrationHandlerService.class);

    private BasicUserDetails getBasicUserDetails(AbstractUserInfoRegisterReq req, User user) {
        BasicUserDetails basic = new BasicUserDetails();
        basic.setUser(user);
        basic.setHeight(req.getHeight());
        basic.setWeight(req.getWeight());
        basic.setDob(req.getDob());
        basic.setCancerHistory(req.getCancerHistory());
        basic.setCancerRelatives(req.getCancerRelatives());
        basic.setLastPeriodDate(req.getLastPeriodDate());
        basic.setAvgCycleLength(req.getAvgCycleLength());
        basic.setMedications(req.getMedications());
        basic.setAllergies(req.getAllergies());
        basic.setFullName(req.getFullName());
        basic.setOrgansWithChronicCondition(req.getOrgansWithChronicCondition());
        basic.setPeriodIrregularities(req.getPeriodIrregularities());
        basic.setUserId(user.getId());
        return basic;
    }

    private PatientSpecificDetails getPatientSpecificDetails(PatientInfoRegisterReq req, User user) {
        PatientSpecificDetails patientSpecificDetails = new PatientSpecificDetails();
        patientSpecificDetails.setCancerStage(req.getCancerStage());
        patientSpecificDetails.setLocation(req.getLocation());
        patientSpecificDetails.setDiagnosisDate(req.getDiagnosisDate());
        patientSpecificDetails.setUser(user);
        patientSpecificDetails.setUserId(user.getId());
        return patientSpecificDetails;
    }

    public void registerBasicUser(BasicUserInfoRegisterReq req, User user) {
        BasicUserDetails basic = getBasicUserDetails(req, user);
        user.setProfilePicture(req.getProfilePicture());
        user.setBasicUser(basic);
        user.setIsRegistrationComplete(YesNo.Y);
        try{
            userRepository.save(user);
        }
        catch (UnsupportedOperationException e){
            logger.info("This error is thrown basic registration {}",e.toString());
        }
    }

    public void registerPatient(PatientInfoRegisterReq req, User user){
        BasicUserDetails basic = getBasicUserDetails(req, user);
        PatientSpecificDetails patientSpecific = getPatientSpecificDetails(req, user);
        user.setProfilePicture(req.getProfilePicture());
        logger.info("Got basic write");
        user.setBasicUser(basic);
        user.setPatientSpecificDetails(patientSpecific);
        user.setIsRegistrationComplete(YesNo.Y);
        logger.info("Got basic right: {}", user);
        try{
            userRepository.save(user);
        }
        catch (UnsupportedOperationException e){
            logger.info("This error is thrown patient registration {}",e.toString());
        }
    }

    public void registerDoctor(DocInfoRegReq req, User user){
        DoctorDetails doctorDetails = new DoctorDetails();
        doctorDetails.setUser(user);
        doctorDetails.setUserId(user.getId());
        doctorDetails.setFullName(req.getFullName());
        doctorDetails.setDepartment(req.getDepartment());
        doctorDetails.setDesignation(req.getDesignation());
        doctorDetails.setQualifications(req.getQualifications());
        doctorDetails.setWorkplace(req.getWorkplace());
        doctorDetails.setContactNumber(req.getContactNumber());
        doctorDetails.setRegistrationNumber(req.getRegistrationNumber());
        user.setIsRegistrationComplete(YesNo.Y);
        user.setProfilePicture(req.getProfilePicture());
        user.setDoctorDetails(doctorDetails);

        logger.debug("Got this far {}", doctorDetails);
        try{
            userRepository.save(user);
        }
        catch (UnsupportedOperationException e){
            logger.info("This error is thrown during doctor registration {}",e.toString());
        }
    }

}
