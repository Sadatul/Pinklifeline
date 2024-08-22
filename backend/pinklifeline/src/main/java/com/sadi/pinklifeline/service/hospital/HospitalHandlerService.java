package com.sadi.pinklifeline.service.hospital;

import static com.sadi.pinklifeline.controllers.hospital.HospitalHandlerV1.UpdateHospitalTestReq;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.hospital.Hospital;
import com.sadi.pinklifeline.models.entities.hospital.HospitalTest;
import com.sadi.pinklifeline.models.entities.hospital.MedicalTest;
import com.sadi.pinklifeline.models.reqeusts.HospitalReq;
import com.sadi.pinklifeline.models.reqeusts.HospitalTestReq;
import com.sadi.pinklifeline.repositories.hospital.HospitalRepository;
import com.sadi.pinklifeline.repositories.hospital.HospitalTestRepository;
import com.sadi.pinklifeline.specifications.HospitalSpecification;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class HospitalHandlerService {
    private final HospitalRepository hospitalRepository;
    private final MedicalTestHandlerService medicalTestHandlerService;
    private final HospitalTestRepository hospitalTestRepository;

    public HospitalHandlerService(HospitalRepository hospitalRepository, MedicalTestHandlerService medicalTestHandlerService, HospitalTestRepository hospitalTestRepository) {
        this.hospitalRepository = hospitalRepository;
        this.medicalTestHandlerService = medicalTestHandlerService;
        this.hospitalTestRepository = hospitalTestRepository;
    }

    public Hospital getHospital(Long id){
        return hospitalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                String.format("Hospital with id %s not found", id)
        ));
    }

    public HospitalTest getHospitalTest(Long id){
        return hospitalTestRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                String.format("HospitalTest with id %s not found", id)
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

    @PreAuthorize("hasRole('ADMIN')")
    public Long addTestToHospital(@Valid HospitalTestReq req) {
        Hospital hospital = getHospital(req.getHospitalId());
        MedicalTest medicalTest = medicalTestHandlerService.getMedicalTest(req.getTestId());
        if(hospitalTestRepository.existsByHospitalAndTest(hospital, medicalTest)) {
            throw new BadRequestFromUserException(
                    String.format("Test with id: %d already exists in hospital with id: %d", req.getTestId(), req.getHospitalId())
            );
        }
        HospitalTest hospitalTest = new HospitalTest(hospital, medicalTest, req.getFee());
        return hospitalTestRepository.save(hospitalTest).getId();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void updateTestToHospital(Long id, UpdateHospitalTestReq req) {
        HospitalTest hospitalTest = getHospitalTest(id);
        hospitalTest.setFee(req.getFee());
        hospitalTestRepository.save(hospitalTest);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTestFromHospital(Long id) {
        hospitalTestRepository.delete(getHospitalTest(id));
    }

    public Specification<Hospital> getSpecification(Long id, String name, String location, Set<Long> testIds){
        Specification<Hospital> spec = Specification.where(null);

        if (name != null && !name.isEmpty()) {
            spec = spec.and(HospitalSpecification.withName(name));
        }

        if (location != null && !location.isEmpty()) {
            spec = spec.and(HospitalSpecification.withLocation(location));
        }

        if (testIds != null && !testIds.isEmpty()) {
            spec = spec.and(HospitalSpecification.withTests(testIds));
        }

        if (id != null){
            spec = spec.and(HospitalSpecification.withId(id));
        }

        return spec;
    }

    public Page<Hospital> getHospitals(Specification<Hospital> spec, Pageable pageable) {
        return hospitalRepository.findAll(spec, pageable);
    }

    public Page<Object[]> getTestByHospital(Long hospitalId, String name, Set<Long> testIds, Pageable pageable) {
        String namePattern = name == null ? null : String.format("%%%s%%", name);
        return hospitalTestRepository.findMedicalTestByHospitalId(hospitalId, namePattern,
                testIds, pageable);
    }

    public Map<Long, Object> getFeesForComparison(Set<Long> hospitalIdSet, Long testId) {
        Object[][] res = hospitalTestRepository.getFeesByTestIdInHospitalIdSet(hospitalIdSet, testId);
        return Stream.of(res).collect(Collectors.toMap((data) -> (Long) data[0], (data) -> data[1]));
    }
}
