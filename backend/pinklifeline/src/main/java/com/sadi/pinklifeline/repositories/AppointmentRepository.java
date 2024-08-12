package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.enums.AppointmentStatus;
import com.sadi.pinklifeline.models.dtos.AppointmentDataForLivePrescriptionDTO;
import com.sadi.pinklifeline.models.dtos.AppointmentDoctorDTO;
import com.sadi.pinklifeline.models.dtos.AppointmentUserDTO;
import com.sadi.pinklifeline.models.entities.Appointment;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    @Query("select app.location.fees from Appointment app where app.id=:id")
    Optional<Integer> getAppointmentFeesById(Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("update Appointment app set app.isPaymentComplete = :status where app.id = :id")
    void updatePaymentStatusById(Long id, Boolean status);

    @Query("select app from Appointment app where app.doctor.userId = :id")
    List<AppointmentUserDTO> findAppointmentByDoctorId(Long id);

    @Query("select app from Appointment app where app.user.id = :id")
    List<AppointmentDoctorDTO> findAppointmentByPatientId(Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("update Appointment app set app.status = 'FINISHED' where app.doctor.userId = :docId and app.status = 'RUNNING'")
    void updateAllUnfinishedMeetingForDoctor(Long docId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("update Appointment app set app.status = :status where app.id = :id")
    void updateAppointmentStatus(Long id, AppointmentStatus status);

    @Query("select new com.sadi.pinklifeline.models.dtos.AppointmentDataForLivePrescriptionDTO(app.id, app.doctor.userId, app.doctor.fullName, app.user.id, app.user.fullName, app.user.basicUser.dob, app.user.basicUser.weight, app.user.basicUser.height, app.status, app.isPaymentComplete, app.isOnline) from Appointment app where app.id = :id")
    Optional<AppointmentDataForLivePrescriptionDTO> findAppointmentDataForLivePrescriptionById(Long id);
}
