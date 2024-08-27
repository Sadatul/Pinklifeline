package com.sadi.pinklifeline.service.hospital;

import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.hospital.MedicalTest;
import com.sadi.pinklifeline.models.reqeusts.MedicalTestReq;
import com.sadi.pinklifeline.repositories.hospital.MedicalTestRepository;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
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

    public List<Map<String, Object>> getMedicalTests(String name, Long id, boolean desc, Sort sort) {
        String namePattern = name == null ? null : String.format("%%%s%%", name);
        List<Object[]> objectList = medicalTestRepository.findMedicalTests(namePattern, id, desc, sort);
        return objectList.stream()
                .map(val -> {
                    List<Object[]> entries = new ArrayList<>(List.of(
                            new Object[]{"id", val[0]},
                            new Object[]{"name", val[1]}
                    ));
                    if (desc) {
                        entries.add(new Object[]{"description", val[2]});
                    }
                    return entries.stream()
                            .collect(Collectors.toMap(data -> (String) data[0], data -> data[1]));
                }).toList();
    }
}
