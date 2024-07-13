package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.Appointment;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    @Query("select app.location.fees from Appointment app where app.id=:id")
    Optional<Integer> getAppointmentFeesById(Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("update Appointment app set app.isPaymentComplete = :status where app.id = :id")
    void updatePaymentStatusById(Long id, Boolean status);
}
