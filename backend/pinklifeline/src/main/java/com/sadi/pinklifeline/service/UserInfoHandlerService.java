package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.exceptions.UserRegistrationAlreadyCompleteException;
import com.sadi.pinklifeline.models.BasicUserDetails;
import com.sadi.pinklifeline.models.BasicUserInfoRegisterReq;
import com.sadi.pinklifeline.models.User;
import com.sadi.pinklifeline.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserInfoHandlerService {

    private final UserRepository userRepository;

    public UserInfoHandlerService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    Logger logger = LoggerFactory.getLogger(UserInfoHandlerService.class);

    private static BasicUserDetails getBasicUserDetails(BasicUserInfoRegisterReq req, User user) {
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

    public User getUserForInfoRegistration(Long id){
        User user = userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if(user.getIsRegistrationComplete().equals(YesNo.Y)){
            throw new UserRegistrationAlreadyCompleteException("User Registration has been Completed before");
        }

        return user;
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
            logger.info("This error is thrown {}",e.toString());
        }
    }

}
