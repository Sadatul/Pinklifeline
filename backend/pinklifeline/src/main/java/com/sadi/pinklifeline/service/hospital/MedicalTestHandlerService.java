package com.sadi.pinklifeline.service.hospital;

import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.hospital.MedicalTest;
import com.sadi.pinklifeline.models.reqeusts.MedicalTestReq;
import com.sadi.pinklifeline.repositories.hospital.MedicalTestRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
public class MedicalTestHandlerService {
    private final MedicalTestRepository medicalTestRepository;

    public MedicalTestHandlerService(MedicalTestRepository medicalTestRepository) {
        this.medicalTestRepository = medicalTestRepository;
    }

    public MedicalTest getMedicalTest(Long id){
        return medicalTestRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                String.format("MedicalTest with id %s not found", id)
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Long addMedicalTest(@Valid MedicalTestReq req) {
        MedicalTest medicalTest = new MedicalTest(req.getName(), req.getDescription());
        return medicalTestRepository.save(medicalTest).getId();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void updateMedicalTest(Long id, MedicalTestReq req) {
        MedicalTest medicalTest = getMedicalTest(id);

        medicalTest.setName(req.getName());
        medicalTest.setDescription(req.getDescription());

        medicalTestRepository.save(medicalTest);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteMedicalTest(Long id) {
        medicalTestRepository.delete(getMedicalTest(id));
    }
}
