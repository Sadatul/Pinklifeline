package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.enums.AppointmentStatus;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.exceptions.ResourceNotFoundException;
import com.sadi.pinklifeline.models.entities.Appointment;
import com.sadi.pinklifeline.models.entities.DoctorConsultationLocation;
import com.sadi.pinklifeline.models.entities.DoctorDetails;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.reqeusts.RegisterAppointmentReq;
import com.sadi.pinklifeline.repositories.AppointmentRepository;
import com.sadi.pinklifeline.service.doctor.DoctorConsultancyLocationsService;
import com.sadi.pinklifeline.service.doctor.DoctorsInfoService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.Objects;

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

    public Appointment getAppointment(Long id){
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Appointment with id %s not found", id)
                ));
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

    @PreAuthorize("hasRole('DOCTOR')")
    public void acceptAppointment(Long id, LocalTime time) {
        String owner = SecurityContextHolder.getContext().getAuthentication().getName();
        Appointment appointment = getAppointment(id);
        verifyAppointmentDoctorAccess(appointment, Long.valueOf(owner));
        if(appointment.getStatus() != AppointmentStatus.REQUESTED){
            throw new BadRequestFromUserException(String.format("Appointment with status %s cannot be accepted", appointment.getStatus()));
        }
        appointment.setTime(time);
        appointment.setStatus(AppointmentStatus.ACCEPTED);
        appointmentRepository.save(appointment);
    }

    public void verifyAppointmentDoctorAccess(Appointment appointment, Long docId) {
        if(!Objects.equals(appointment.getDoctor().getUserId(), docId)){
            throw new AuthorizationDeniedException(
                    String.format("User with id:%d doesn't have access to the appointment: %d"
                            , docId, appointment.getId()),
                    () -> false);
        }
    }

    public void verifyAppointmentPatientAccess(Appointment appointment, Long patientId) {
        if(!Objects.equals(appointment.getUser().getId(), patientId)){
            throw new AuthorizationDeniedException(
                    String.format("User with id:%d doesn't have access to the appointment: %d"
                            , patientId, appointment.getId()),
                    () -> false);
        }
    }

    public void cancelAppointment(Long id) {
        String owner = SecurityContextHolder.getContext().getAuthentication().getName();
        Appointment appointment = getAppointment(id);
        verifyAppointmentPatientAccess(appointment, Long.valueOf(owner));
        if(appointment.getStatus() != AppointmentStatus.REQUESTED && appointment.getStatus() != AppointmentStatus.ACCEPTED){
            throw new BadRequestFromUserException(String.format("Appointment with status %s cannot be cancelled", appointment.getStatus()));
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    @PreAuthorize("hasRole('DOCTOR')")
    public void declineAppointment(Long id) {
        String owner = SecurityContextHolder.getContext().getAuthentication().getName();
        Appointment appointment = getAppointment(id);
        verifyAppointmentDoctorAccess(appointment, Long.valueOf(owner));
        if(appointment.getStatus() != AppointmentStatus.REQUESTED && appointment.getStatus() != AppointmentStatus.ACCEPTED){
            throw new BadRequestFromUserException(String.format("Appointment with status %s cannot be cancelled", appointment.getStatus()));
        }
        appointment.setStatus(AppointmentStatus.DECLINED);
        appointmentRepository.save(appointment);
    }
}
