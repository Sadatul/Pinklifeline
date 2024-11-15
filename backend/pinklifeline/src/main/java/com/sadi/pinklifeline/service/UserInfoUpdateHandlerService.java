package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.models.entities.BasicUserDetails;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.entities.PatientSpecificDetails;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.*;
import com.sadi.pinklifeline.repositories.BasicUserDetailsRepository;
import com.sadi.pinklifeline.repositories.UserRepository;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;


@Service
public class UserInfoUpdateHandlerService {

    private final UserRepository userRepository;
    private final SelfTestReminderHandlerService selfTestReminderHandlerService;
    private final UserService userService;
    private final BasicUserDetailsRepository basicUserDetailsRepository;
    Logger logger = LoggerFactory.getLogger(UserInfoUpdateHandlerService.class);

    public UserInfoUpdateHandlerService(UserRepository userRepository, SelfTestReminderHandlerService selfTestReminderHandlerService, UserService userService, BasicUserDetailsRepository basicUserDetailsRepository) {
        this.userRepository = userRepository;
        this.selfTestReminderHandlerService = selfTestReminderHandlerService;
        this.userService = userService;
        this.basicUserDetailsRepository = basicUserDetailsRepository;
    }

    private BasicUserDetails getBasicUserDetails(AbstractUserInfoUpdateReq req, User user) {
        BasicUserDetails basic = user.getBasicUser();
        basic.getUser().setFullName(req.getFullName());
        basic.setHeight(req.getHeight());
        basic.setWeight(req.getWeight());
        basic.setCancerHistory(req.getCancerHistory());
        basic.setCancerRelatives(req.getCancerRelatives());
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
        patientSpecificDetails.setLocation(req.getLocation());
        return patientSpecificDetails;
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

    @PreAuthorize("(#id.toString() == authentication.name)")
    public void updateProfilePicture(Long id, String profilePicture){
        userRepository.updateProfilePictureById(id, profilePicture);
    }

    public void updateDoctorInfo(DocInfoUpdateReq req, User user) {
        DoctorDetails doctorDetails = user.getDoctorDetails();

        doctorDetails.getUser().setFullName(req.getFullName());
        doctorDetails.setFullName(req.getFullName());
        doctorDetails.setDepartment(req.getDepartment());
        doctorDetails.setDesignation(req.getDesignation());
        doctorDetails.setQualifications(req.getQualifications());
        doctorDetails.setWorkplace(req.getWorkplace());
        doctorDetails.setContactNumber(req.getContactNumber());

        user.setDoctorDetails(doctorDetails);

        logger.debug("Updated doctorDetails of User Bean far {}", doctorDetails);

        try{
            userRepository.save(user);
        }
        catch (UnsupportedOperationException e){
            logger.info("This error is thrown during doctor info update {}",e.toString());
        }
    }

    @Transactional
    public void updatePeriodData(@Valid PeriodDataUpdateReq req) {
        Long userId = SecurityUtils.getOwnerID();
        userService.getUserIfRegisteredOnlyId(userId);
        basicUserDetailsRepository.updatePeriodDataById(req.getLastPeriodDate(), req.getAvgGap(), userId);
        selfTestReminderHandlerService.setNewReminder(req.getLastPeriodDate(), req.getAvgGap(), userId, true);
    }
}
