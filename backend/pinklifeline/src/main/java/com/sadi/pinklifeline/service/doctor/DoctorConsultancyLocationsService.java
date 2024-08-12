package com.sadi.pinklifeline.service.doctor;

import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.DoctorConsultationLocation;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.reqeusts.DoctorLocationReq;
import com.sadi.pinklifeline.repositories.DoctorConsultancyLocationsRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DoctorConsultancyLocationsService {
    private final DoctorConsultancyLocationsRepository locationsRepository;
    private final DoctorsInfoService doctorsInfoService;

    public DoctorConsultancyLocationsService(DoctorConsultancyLocationsRepository locationsRepository, DoctorsInfoService doctorsInfoService) {
        this.locationsRepository = locationsRepository;
        this.doctorsInfoService = doctorsInfoService;
    }

    public DoctorConsultationLocation getLocation(Long locId){
        return locationsRepository.findById(locId).orElseThrow(
                () -> new ResourceNotFoundException(String.format("Location with id:%d not found", locId))
        );
    }

    @PreAuthorize("#docId.toString() == authentication.name and hasRole('DOCTOR')")
    public Long addLocation(DoctorLocationReq req, Long docId){
        DoctorDetails doc = doctorsInfoService.getDoctor(docId);
        DoctorConsultationLocation location = new DoctorConsultationLocation(req.getLocation(), req.getStart(),
                req.getEnd(), req.getWorkdays(), doc, req.getFees());
        return locationsRepository.save(location).getId();
    }

    public void verifyLocationAccess(DoctorConsultationLocation location, Long docId){
        if(!Objects.equals(location.getDoctorDetails().getUserId(), docId)){
            throw new AuthorizationDeniedException(
                    String.format("User with id:%d doesn't have access to the location: %d", docId, location.getId()),
                    () -> false);
        }
    }

    @PreAuthorize("(#docId.toString() == authentication.name and hasRole('DOCTOR'))")
    public void updateLocation(DoctorLocationReq req, Long locId, Long docId) {
        DoctorConsultationLocation location = getLocation(locId);
        verifyLocationAccess(location, docId);
        location.setLocation(req.getLocation());
        location.setStart(req.getStart());
        location.setEnd(req.getEnd());
        location.setWorkdays(req.getWorkdays());
        location.setFees(req.getFees());
        locationsRepository.save(location);
    }

    @PreAuthorize("(#docId.toString() == authentication.name and hasRole('DOCTOR'))")
    public void deleteLocation(Long locId, Long docId) {
        DoctorConsultationLocation location = getLocation(locId);
        verifyLocationAccess(location, docId);
        locationsRepository.delete(location);
    }

    public List<Map<String, Object>> getDoctorConsultationLocations(Long docId){
        List<DoctorConsultationLocation> locations = locationsRepository.findByDoctorId(docId);
        List<Map<String, Object>> res = new ArrayList<>();
        for (DoctorConsultationLocation location : locations) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", location.getId());
            map.put("location", location.getLocation());
            map.put("start", location.getStart());
            map.put("end", location.getEnd());
            map.put("workdays", location.getWorkdays());
            map.put("fees", location.getFees());
            res.add(map);
        }
        return res;
    }
}
