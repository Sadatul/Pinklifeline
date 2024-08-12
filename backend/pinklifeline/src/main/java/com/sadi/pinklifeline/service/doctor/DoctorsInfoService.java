package com.sadi.pinklifeline.service.doctor;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.exceptions.UnverifiedResourceException;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.repositories.DoctorDetailsRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DoctorsInfoService {
    private final DoctorDetailsRepository doctorRepository;

    public DoctorsInfoService(DoctorDetailsRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public DoctorDetails getDoctor(Long id) {
        return doctorRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException(
                String.format("Doctor with id %s must complete his registration first", id)
        ));
    }

    public DoctorDetails getDoctorIfVerified(Long id) {
        DoctorDetails doctorDetails = getDoctor(id);
        if(doctorDetails.getIsVerified() == YesNo.N){
            throw new UnverifiedResourceException(String.format("Doc with id: %d is not yet verified", id));
        }
        return doctorDetails;
    }


}
