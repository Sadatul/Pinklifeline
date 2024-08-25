package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.Report;
import com.sadi.pinklifeline.models.entities.SharedReport;
import com.sadi.pinklifeline.models.reqeusts.ReportReq;
import com.sadi.pinklifeline.repositories.ReportRepository;
import com.sadi.pinklifeline.repositories.SharedReportRepository;
import com.sadi.pinklifeline.utils.DbCleaner;
import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Slf4j
public class ReportIntegrationTest extends AbstractBaseIntegrationTest{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private SharedReportRepository sharedReportRepository;

    @Autowired
    private DbCleaner dbCleaner;

    @Autowired
    private EntityManager entityManager;

    @AfterEach
    public void cleanDb() {
        dbCleaner.clearDatabase();
        entityManager.clear();
    }

    @Test
    @Sql(value = "/test/ReportTest.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void addUpdateQueryShareRevokeDeleteReportTest() throws Exception {
        Long userId = 12L;
        Long doctorId = 14L;
        Long newReportId = 5L;
        Long newSharedReportId = 1L;

        String addReportRequestBody = """
                {
                	"doctorName": "Dr. Jenny Hossain",
                	"hospitalName": "Popular Hospital",
                	"date": "2024-08-08",
                	"summary": "ljdflasldfsldfjlsdflsdfjlsdfjsldfjsldfjsldfjsldfjlasdjf",
                  	"fileLink": "google.com",
                	"keywords": ["Heart", "Lungs"]
                }
                
                """;

        String token = mint(userId, List.of(Roles.ROLE_PATIENT), true);
        String location = mockMvc.perform(post("/v1/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", token))
                        .content(addReportRequestBody)).andExpect(status().isCreated())
                .andReturn().getResponse().getHeader("Location");

        log.info("New resources is created at: {}", location);

        Optional<Report> newReport = reportRepository.findById(newReportId);

        if(newReport.isEmpty()){
            fail("Report was not created");
        }

        ReportReq req = objectMapper.readValue(addReportRequestBody, ReportReq.class);
        log.info("New report req: {}", req.toString());
        log.info("New report is created at: {}", newReport.get());

        assertReport(newReport.get(), req);
        assertEquals(userId, newReport.get().getUser().getId());

        String res = mockMvc.perform(get("/v1/reports")
                .header("Authorization", String.format("Bearer %s", token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(4))
                .andReturn().getResponse().getContentAsString();

        log.info("Response for first query: {}", res);

        res = mockMvc.perform(get("/v1/reports")
                        .header("Authorization", String.format("Bearer %s", token))
                        .param("doctorName", "Dr.")
                        .param("hospitalName", "Popular")
                        .param("startDate", "2024-02-08")
                        .param("keywords", "liver,kidney"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(4))
                .andReturn().getResponse().getContentAsString();

        log.info("Response for second query: {}", res);
        String updateReportRequestBody = """
                {
                	"doctorName": "Dr. Janna Hossain",
                	"hospitalName": "Giza Medical, Khulna",
                	"date": "2020-08-08",
                	"summary": "ljdflaslldfjlsdflsdfjlsdfjsldfjsldfjsldfjsldfjlasdjf",
                  	"fileLink": "amazon.com",
                	"keywords": ["Heart"]
                }
                
                """;

        String updateToken = mint(userId, List.of(Roles.ROLE_PATIENT), false);
        mockMvc.perform(put("/v1/reports/{newReportId}", newReportId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", updateToken))
                        .content(updateReportRequestBody)).andExpect(status().isNoContent());


        Optional<Report> updatedReport = reportRepository.findById(newReportId);

        if(updatedReport.isEmpty()){
            fail("Updated Report was deleted");
        }

        ReportReq updateReq = objectMapper.readValue(updateReportRequestBody, ReportReq.class);
        log.info("Update report req: {}", updateReq.toString());
        log.info("Updated report is : {}", updatedReport.get());

        assertReport(updatedReport.get(), updateReq);
        assertEquals(userId, updatedReport.get().getUser().getId());

        String shareRequest = String.format(
                """
               {
                    "reportId": %d,
                    "doctorId": %d
               }
               """, newReportId, doctorId
        );


        String shareToken = mint(userId, List.of(Roles.ROLE_PATIENT), false);
        String sharedReportLocation = mockMvc.perform(post("/v1/reports/share")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", shareToken))
                .content(shareRequest)).andExpect(status().isCreated())
                .andReturn().getResponse().getHeader("Location");

        log.info("Shared report location: {}", sharedReportLocation);

        Optional<SharedReport> sharedReport = sharedReportRepository.findById(newSharedReportId);
        if(sharedReport.isEmpty()){
            fail("File was not shared");
        }

        assertEquals(sharedReport.get().getReport().getId(), newReportId);
        assertEquals(sharedReport.get().getDoctor().getUserId(), doctorId);
        assertNull(sharedReport.get().getExpirationTime());

        res = mockMvc.perform(get("/v1/reports/share")
                        .header("Authorization", String.format("Bearer %s", shareToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(newSharedReportId))
                .andReturn().getResponse().getContentAsString();
        log.info("Shared reports for user {}", res);

        res = mockMvc.perform(get("/v1/reports/{newReportId}/share", newReportId)
                        .header("Authorization", String.format("Bearer %s", shareToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(newSharedReportId))
                .andReturn().getResponse().getContentAsString();
        log.info("Report shared info for report with id {}: {}", newReportId, res);
        String doctorToken = mint(doctorId, List.of(Roles.ROLE_DOCTOR), false);

        res = mockMvc.perform(get("/v1/reports/share")
                        .header("Authorization", String.format("Bearer %s", doctorToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(newSharedReportId))
                .andReturn().getResponse().getContentAsString();

        log.info("Shared reports for doctor {}", res);
        String deleteToken = mint(userId, List.of(Roles.ROLE_PATIENT), false);

        mockMvc.perform(delete("/v1/reports/{newReportId}", newReportId)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", deleteToken)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(delete("/v1/reports/share/{newSharedReportId}", newSharedReportId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", shareToken)))
                        .andExpect(status().isNoContent());

        mockMvc.perform(delete("/v1/reports/{newReportId}", newReportId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", deleteToken)))
                        .andExpect(status().isNoContent());

        Optional<Report> deletedReport = reportRepository.findById(newReportId);

        if(deletedReport.isPresent()){
            fail("Report was not deleted");
        }
    }

    void assertReport(Report report, ReportReq req) {
        assertEquals(req.getDoctorName(), report.getDoctorName());
        assertEquals(req.getHospitalName(), report.getHospitalName());
        assertEquals(req.getSummary(), report.getSummary());
        assertEquals(req.getDate(), report.getDate());
        assertEquals(req.getFileLink(), report.getFileLink());
        assertArrayEquals(req.getKeywords().toArray(new String[0]), report.getKeywords().toArray(new String[0]));
    }


    private String mint(Long id, List<Roles> roles, boolean isSubscribed){
        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .subject(id.toString())
                .issuer("self")
                .audience(List.of("pinklifeline"))
                .claim("scope", roles)
                .claim("subscribed", isSubscribed);
        JwtEncoderParameters parameters = JwtEncoderParameters.from(builder.build());
        return this.jwtEncoder.encode(parameters).getTokenValue();
    }
}
