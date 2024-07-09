package com.sadi.pinklifeline.service.doctor.features;

import com.sadi.pinklifeline.models.entities.DoctorConsultationLocation;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.reqeusts.DoctorLocationReq;
import com.sadi.pinklifeline.repositories.DoctorConsultancyLocationsRepository;
import com.sadi.pinklifeline.service.doctor.DoctorsInfoService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
public class DoctorConsultancyLocationsService {
    private final DoctorConsultancyLocationsRepository locationsRepository;
    private final DoctorsInfoService doctorsInfoService;

    public DoctorConsultancyLocationsService(DoctorConsultancyLocationsRepository locationsRepository, DoctorsInfoService doctorsInfoService) {
        this.locationsRepository = locationsRepository;
        this.doctorsInfoService = doctorsInfoService;
    }

    @PreAuthorize("#docId.toString() == authentication.name and hasRole('DOCTOR')")
    public Long addLocation(DoctorLocationReq req, Long docId){
        DoctorDetails doc = doctorsInfoService.getDoctor(docId);
        DoctorConsultationLocation location = new DoctorConsultationLocation(req.getLocation(), req.getStart(),
                req.getEnd(), req.getWorkdays(), doc);
        return locationsRepository.save(location).getId();
    }
}
