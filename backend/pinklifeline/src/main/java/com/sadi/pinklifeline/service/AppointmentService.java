package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.AppointmentStatus;
import com.sadi.pinklifeline.models.entities.Appointment;
import com.sadi.pinklifeline.models.entities.DoctorConsultationLocation;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.RegisterAppointmentReq;
import com.sadi.pinklifeline.repositories.AppointmentRepository;
import com.sadi.pinklifeline.service.doctor.DoctorConsultancyLocationsService;
import com.sadi.pinklifeline.service.doctor.DoctorsInfoService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final UserService userService;
    private final DoctorsInfoService doctorsInfoService;
    private final DoctorConsultancyLocationsService locationsService;

    public AppointmentService(AppointmentRepository appointmentRepository, UserService userService, DoctorsInfoService doctorsInfoService, DoctorConsultancyLocationsService locationsService) {
        this.appointmentRepository = appointmentRepository;
        this.userService = userService;
        this.doctorsInfoService = doctorsInfoService;
        this.locationsService = locationsService;
    }

    @PreAuthorize("#req.patientId.toString() == authentication.name")
    public Long addAppointment(RegisterAppointmentReq req) {
        User user = userService.getUserIfRegisteredOnlyId(req.getPatientId());
        DoctorDetails doctorDetails = doctorsInfoService.getDoctorIfVerified(req.getDoctorId());
        DoctorConsultationLocation location = locationsService.getLocation(req.getLocationId());
        locationsService.verifyLocationAccess(location, req.getDoctorId());

        Appointment appointment = new Appointment();
        appointment.setUser(user);
        appointment.setDoctor(doctorDetails);
        appointment.setPatientContactNumber(req.getPatientContactNumber());
        appointment.setLocation(location);
        appointment.setDate(req.getDate());
        appointment.setTime(req.getTime());
        appointment.setIsOnline(req.getIsOnline());

        return appointmentRepository.save(appointment).getId();
    }
}
