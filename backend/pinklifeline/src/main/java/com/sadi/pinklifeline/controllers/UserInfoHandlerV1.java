package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.exceptions.UserRegistrationAlreadyCompleteException;
import com.sadi.pinklifeline.models.BasicUserDetails;
import com.sadi.pinklifeline.models.BasicUserInfoRegisterReq;
import com.sadi.pinklifeline.models.User;
import com.sadi.pinklifeline.repositories.UserRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1")
public class UserInfoHandlerV1 {
    Logger logger = LoggerFactory.getLogger(UserInfoHandlerV1.class);
    private final UserRepository userRepository;

    public UserInfoHandlerV1(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/ROLE_BASICUSER/register/{id}")
    @PreAuthorize("(#id.toString() == authentication.name) and hasRole('BASICUSER')")
    public ResponseEntity<Void> registerBasicUserInfo(@PathVariable Long id,
                                                    @Valid @RequestBody BasicUserInfoRegisterReq req){

        logger.info("works {}", req.toString());
        User user = userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if(user.getIsRegistrationComplete().equals(YesNo.Y)){
            throw new UserRegistrationAlreadyCompleteException("User Registration has been Completed before");
        }

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
        user.setProfilePicture(req.getProfilePicture());
        user.setBasicUser(basic);
        user.setIsRegistrationComplete(YesNo.Y);

        try{
            userRepository.save(user);
        }
        catch (UnsupportedOperationException e){
            logger.info("This error is thrown {}",e.toString());
        }
        return ResponseEntity.noContent().build();
    }
}
