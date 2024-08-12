package com.sadi.pinklifeline.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.sadi.pinklifeline.enums.AppointmentStatus;
import com.sadi.pinklifeline.exceptions.BadRequestFromUserException;
import com.sadi.pinklifeline.exceptions.InternalServerErrorException;
import com.sadi.pinklifeline.models.dtos.AppointmentDataForLivePrescriptionDTO;
import com.sadi.pinklifeline.models.dtos.LivePrescription;
import com.sadi.pinklifeline.models.entities.Appointment;
import com.sadi.pinklifeline.repositories.LivePrescriptionRepository;
import com.sadi.pinklifeline.repositories.OnlineMeetingRepository;
import com.sadi.pinklifeline.utils.CodeGenerator;
import com.sadi.pinklifeline.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.util.Pair;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
@Slf4j
public class OnlineMeetingService {
    private final OnlineMeetingRepository onlineMeetingRepository;
    private final AppointmentService appointmentService;
    private final LivePrescriptionRepository livePrescriptionRepository;

    public OnlineMeetingService(OnlineMeetingRepository onlineMeetingRepository, AppointmentService appointmentService, LivePrescriptionRepository livePrescriptionRepository) {
        this.onlineMeetingRepository = onlineMeetingRepository;
        this.appointmentService = appointmentService;
        this.livePrescriptionRepository = livePrescriptionRepository;
    }

    void verifyIfMeetingCanBeStarted(AppointmentDataForLivePrescriptionDTO appointment, Long docId){
        if(!Objects.equals(appointment.getDoctorId(), docId)){
            throw new AuthorizationDeniedException(
                    String.format("User with id:%d doesn't have access to the appointment: %d"
                            , docId, appointment.getId()),
                    () -> false);
        }
        if(!appointment.getStatus().equals(AppointmentStatus.ACCEPTED)){
            throw new BadRequestFromUserException(
                    String.format("Can not start an appointment with status %s", appointment.getStatus())
            );
        }
        if(!appointment.getIsOnline()){
            throw new BadRequestFromUserException("Can not start an appointment that is not online");
        }
        if(!appointment.getIsPaymentComplete())
        {
            throw new BadRequestFromUserException("Patient needs to complete the payment first");
        }
        if(onlineMeetingRepository.ifUserInMeeting(appointment.getDoctorId())){
            throw new BadRequestFromUserException(
                    String.format("Doctor with id:%d is in another meeting", appointment.getDoctorId())
            );
        }
        if(onlineMeetingRepository.ifUserInMeeting(appointment.getPatientId())){
            throw new BadRequestFromUserException(
                    String.format("Patient with id:%d is in another meeting", appointment.getPatientId())
            );
        }
    }

    @PreAuthorize("hasRole('DOCTOR')")
    public Map<String, Object> startMeeting(Long appointmentId){
        Long doctorId = SecurityUtils.getOwnerID();
        var appointment = appointmentService.getAppointmentDataForLivePrescription(appointmentId);
        verifyIfMeetingCanBeStarted(appointment, doctorId);
        String callId = CodeGenerator.callIdGenerator(appointment.getPatientId(),
                appointment.getDoctorId());
        try {
            onlineMeetingRepository.putAppIdAndCallIdForMeeting(appointment.getPatientId(),
                    Pair.of(appointmentId, callId));
            onlineMeetingRepository.putAppIdAndCallIdForMeeting(appointment.getDoctorId(),
                    Pair.of(appointmentId, callId));
        } catch (JsonProcessingException e) {
            throw new InternalServerErrorException("Server error occurred while parsing request");
        }
        appointmentService.updateAppointmentStatus(appointmentId, AppointmentStatus.RUNNING);

        // Processing for live prescription
        Long age = ChronoUnit.YEARS.between(appointment.getPatientDob(), LocalDate.now());
        LivePrescription prescription = new LivePrescription(appointmentId, appointment.getPatientId(), appointment.getPatientName(),
                appointment.getDoctorId(), appointment.getDoctorName(), appointment.getWeight(), appointment.getHeight(), age,
                "", new ArrayList<>(), new ArrayList<>());
        try {
            livePrescriptionRepository.putLivePrescription(prescription, callId);
        } catch (JsonProcessingException e) {
            throw new InternalServerErrorException("Server error occurred while parsing request");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("callId", callId);
        response.put("prescription", prescription);
        return response;
    }

    public Map<String, Object> joinMeeting(){
        Long id = SecurityUtils.getOwnerID();
        Pair<Long, String> data = getMeetingDataForUser(id);
        Map<String, Object> map = new HashMap<>();
        map.put("callId", data.getSecond());
        // Data for live prescription
        LivePrescription prescription;
        try {
            prescription = livePrescriptionRepository.getLivePrescription(data.getSecond())
                    .orElseGet(() -> new LivePrescription(null, null, null, null,
                            null, null, null, null, "", new ArrayList<>(), new ArrayList<>()));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        map.put("prescription", prescription);
        return map;
    }

    public void closeMeeting(){
        Long id = SecurityUtils.getOwnerID();
        Pair<Long, String> data = getMeetingDataForUser(id);
        Long appointmentId = data.getFirst();
        Appointment appointment = appointmentService.getAppointment(appointmentId);
        appointment.setStatus(AppointmentStatus.FINISHED);
        onlineMeetingRepository.deleteMeetingData(appointment.getUser().getId());
        onlineMeetingRepository.deleteMeetingData(appointment.getDoctor().getUserId());
        livePrescriptionRepository.deleteLivePrescription(data.getSecond());
        appointmentService.saveAppointment(appointment);
    }

    public Pair<Long, String> getMeetingDataForUser(Long id){
        Pair<Long, String> data;
        try {
            data = onlineMeetingRepository.getAppIdAndCallIdForMeeting(id).orElseThrow(
                    () -> new BadRequestFromUserException(String.format("No meeting is available for user with id: %d", id)
                    ));
        } catch (JsonProcessingException e) {
            throw new InternalServerErrorException("Server error occurred while parsing request");
        }
        return data;
    }
}
