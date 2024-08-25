package com.sadi.pinklifeline.service.doctor;

import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.exceptions.UnverifiedResourceException;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.repositories.DoctorDetailsRepository;
import com.sadi.pinklifeline.service.UserService;
import com.sadi.pinklifeline.specifications.DoctorDetailsSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class DoctorsInfoService {
    private final DoctorDetailsRepository doctorRepository;
    private final UserService userService;

    public DoctorsInfoService(DoctorDetailsRepository doctorRepository, UserService userService) {
        this.doctorRepository = doctorRepository;
        this.userService = userService;
    }

    public DoctorDetails getDoctor(Long id) {
        return doctorRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException(
                String.format("Doctor with id %s must complete his registration first", id)
        ));
    }

    public boolean existsById(Long id) {
        return doctorRepository.existsById(id);
    }

    public DoctorDetails getDoctorIfVerified(Long id) {
        DoctorDetails doctorDetails = getDoctor(id);
        if(doctorDetails.getIsVerified() == YesNo.N){
            throw new UnverifiedResourceException(String.format("Doc with id: %d is not yet verified", id));
        }
        return doctorDetails;
    }

    public DoctorDetails getDoctorIfNotVerified(Long id) {
        DoctorDetails doctorDetails = getDoctor(id);
        if(doctorDetails.getIsVerified() == YesNo.Y){
            throw new UnverifiedResourceException(String.format("Doc with id: %d is already verified", id));
        }
        return doctorDetails;
    }

    public Page<DoctorDetails> getDoctors(Specification<DoctorDetails> spec, Pageable pageable) {
        return doctorRepository.findAll(spec, pageable);
    }

    public Specification<DoctorDetails> getSpecification(String fullName, String registrationNumber, List<String> qualifications,
                                                         String workplace, String department, String designation, String contactNumber,
                                                         YesNo isVerified) {
        Specification<DoctorDetails> spec = Specification.where(null);

        if (qualifications != null && !qualifications.isEmpty()) {
            spec = spec.and(DoctorDetailsSpecification.withQualification(qualifications));
        }
        if (fullName != null && !fullName.isEmpty()) {
            spec = spec.and(DoctorDetailsSpecification.withFullName(fullName));
        }
        if (registrationNumber != null && !registrationNumber.isEmpty()) {
            spec = spec.and(DoctorDetailsSpecification.withRegistrationNumber(registrationNumber));
        }
        if (workplace != null && !workplace.isEmpty()) {
            spec = spec.and(DoctorDetailsSpecification.withWorkplace(workplace));
        }
        if (department != null && !department.isEmpty()) {
            spec = spec.and(DoctorDetailsSpecification.withDepartment(department));
        }
        if (designation != null && !designation.isEmpty()) {
            spec = spec.and(DoctorDetailsSpecification.withDesignation(designation));
        }
        if (contactNumber != null && !contactNumber.isEmpty()) {
            spec = spec.and(DoctorDetailsSpecification.withContactNumber(contactNumber));
        }
        if (isVerified != null) {
            spec = spec.and(DoctorDetailsSpecification.withIsVerified(isVerified));
        }
        return spec;
    }

    public List<Map<String, Object>> convertDoctorDetailsToMap(List<DoctorDetails> doctorDetailsList) {
        return doctorDetailsList.stream()
                .map(doctor -> Stream.of(new Object[][]{
                        { "id", doctor.getUserId() },
                        { "fullName", doctor.getFullName() },
                        { "registrationNumber", doctor.getRegistrationNumber() },
                        { "qualifications", doctor.getQualifications() },
                        { "workplace", doctor.getWorkplace() },
                        { "department", doctor.getDepartment() },
                        { "designation", doctor.getDesignation() },
                        { "contactNumber", doctor.getContactNumber() }
                }).collect(Collectors.toMap(data -> (String) data[0], data -> data[1])
                )).toList();
    }

    public String verifyDoctor(Long id) {
        DoctorDetails doctorDetails = getDoctorIfNotVerified(id);
        doctorDetails.setIsVerified(YesNo.Y);
        doctorRepository.save(doctorDetails);
        return userService.getUsernameById(id);
    }
}
