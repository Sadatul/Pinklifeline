package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.dtos.ReportSharedInfoDTO;
import com.sadi.pinklifeline.models.entities.SharedReport;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SharedReportRepository extends JpaRepository<SharedReport, Long>, JpaSpecificationExecutor<SharedReport> {

    @Query("select sr from SharedReport sr join fetch sr.report where sr.id = :id")
    Optional<SharedReport> findByIdWithReport(Long id);

    @Query("select new com.sadi.pinklifeline.models.dtos.ReportSharedInfoDTO(sr.id, sr.doctor.user.username, sr.doctor.fullName, sr.expirationTime) from SharedReport sr where sr.report.id = :reportId and (sr.expirationTime > :now or sr.expirationTime is null) order by sr.doctor.user.username")
    List<ReportSharedInfoDTO> findSharedReportInfoByReportId(Long reportId, LocalDateTime now);

    @Query("select sr from SharedReport sr where sr.report.id = :reportId and sr.doctor.userId = :docId and (sr.expirationTime > :now or sr.expirationTime is null)")
    Optional<SharedReport> findSharedReportByReportIdAndDocId(Long reportId, Long docId, LocalDateTime now);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("delete from SharedReport sr where sr.expirationTime < :now")
    void deleteSharedReportIfExpired(LocalDateTime now);
}
