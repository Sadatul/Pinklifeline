package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.dtos.ReportSharedInfoDTO;
import com.sadi.pinklifeline.models.dtos.SharedReportDTO;
import com.sadi.pinklifeline.models.entities.SharedReport;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SharedReportRepository extends JpaRepository<SharedReport, Long> {

    @Query("select sr from SharedReport sr join fetch sr.report where sr.id = :id")
    Optional<SharedReport> findByIdWithReport(Long id);

    @Query("select new com.sadi.pinklifeline.models.dtos.SharedReportDTO(sr.id, sr.report.user.username, sr.report.user.basicUser.fullName, sr.expirationTime, sr.report.id, sr.report.doctorName, sr.report.date, sr.report.hospitalName, sr.report.summary, sr.report.fileLink) from SharedReport sr where sr.doctor.userId = :doctorId and (sr.expirationTime > :now or sr.expirationTime is null) order by sr.report.user.username")
    List<SharedReportDTO> findSharedReportInfoByDoctorId(Long doctorId, LocalDateTime now);

    @Query("select new com.sadi.pinklifeline.models.dtos.SharedReportDTO(sr.id, sr.doctor.user.username, sr.doctor.fullName, sr.expirationTime, sr.report.id, sr.report.doctorName, sr.report.date, sr.report.hospitalName, sr.report.summary, sr.report.fileLink) from SharedReport sr where sr.report.user.id = :userId and (sr.expirationTime > :now or sr.expirationTime is null) order by sr.doctor.user.username")
    List<SharedReportDTO> findSharedReportInfoByUserId(Long userId, LocalDateTime now);

    @Query("select new com.sadi.pinklifeline.models.dtos.ReportSharedInfoDTO(sr.id, sr.doctor.user.username, sr.doctor.fullName, sr.expirationTime) from SharedReport sr where sr.report.id = :reportId and (sr.expirationTime > :now or sr.expirationTime is null) order by sr.doctor.user.username")
    List<ReportSharedInfoDTO> findSharedReportInfoByReportId(Long reportId, LocalDateTime now);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("delete from SharedReport sr where sr.expirationTime < :now")
    void deleteSharedReportIfExpired(LocalDateTime now);
}
