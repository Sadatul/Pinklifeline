package com.sadi.pinklifeline.service.hospital;

import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.hospital.Hospital;
import com.sadi.pinklifeline.models.reqeusts.HospitalReq;
import com.sadi.pinklifeline.repositories.hospital.HospitalRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
public class HospitalHandlerService {
    private final HospitalRepository hospitalRepository;

    public HospitalHandlerService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    public Hospital getHospital(Long id){
        return hospitalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                String.format("Hospital with id %s not found", id)
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Long addHospital(@Valid HospitalReq req) {
        Hospital hospital = new Hospital(req.getName(), req.getDescription(),
                req.getLocation(), req.getContactNumber(), req.getEmail());
        return hospitalRepository.save(hospital).getId();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void updateHospital(Long id, HospitalReq req) {
        Hospital hospital = getHospital(id);

        hospital.setName(req.getName());
        hospital.setDescription(req.getDescription());
        hospital.setLocation(req.getLocation());
        hospital.setContactNumber(req.getContactNumber());
        hospital.setEmail(req.getEmail());

        hospitalRepository.save(hospital);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteHospital(Long id) {
        hospitalRepository.delete(getHospital(id));
    }

    public boolean existsById(Long id) {
        return hospitalRepository.existsById(id);
    }
}
