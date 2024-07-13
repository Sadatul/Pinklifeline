package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
}
