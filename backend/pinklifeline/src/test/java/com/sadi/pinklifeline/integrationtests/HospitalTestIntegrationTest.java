package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.hospital.Hospital;
import com.sadi.pinklifeline.models.entities.hospital.HospitalTest;
import com.sadi.pinklifeline.models.entities.hospital.MedicalTest;
import com.sadi.pinklifeline.models.reqeusts.HospitalReq;
import com.sadi.pinklifeline.models.reqeusts.HospitalTestReq;
import com.sadi.pinklifeline.models.reqeusts.MedicalTestReq;
import com.sadi.pinklifeline.repositories.hospital.HospitalRepository;
import com.sadi.pinklifeline.repositories.hospital.HospitalTestRepository;
import com.sadi.pinklifeline.repositories.hospital.MedicalTestRepository;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Slf4j
public class HospitalTestIntegrationTest extends AbstractBaseIntegrationTest{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DbCleaner dbCleaner;

    @Autowired
    private EntityManager entityManager;
    @Autowired
    private HospitalRepository hospitalRepository;
    @Autowired
    private MedicalTestRepository medicalTestRepository;
    @Autowired
    private HospitalTestRepository hospitalTestRepository;

    @AfterEach
    public void cleanDb() {
        dbCleaner.clearDatabase();
        entityManager.clear();
    }

    @Test
    public void addUpdateDeleteHospitalMedicalTestHospitalTest() throws Exception{
        Long newHospitalId = 1L;
        Long newHospitalTestId = 1L;
        Long newMedicalTestId = 1L;
        Long adminId = 1L;

        String addHospitalReq = """
                    {
                      "name": "City Medical College, Khulna",
                      "description": "A hospital with all kinds of facilities",
                      "location": "Moylapota, Khulna",
                      "contactNumber": "01738223344",
                      "email": "infos@gazimedicalcollege.com"
                    }
                """;

        String adminToken = mint(adminId, List.of(Roles.ROLE_ADMIN));
        String location = mockMvc.perform(post("/v1/ROLE_ADMIN/hospitals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", adminToken))
                        .content(addHospitalReq)).andExpect(status().isCreated())
                        .andReturn().getResponse().getHeader("Location");

        log.info("New hospital is created at: {}", location);
        Optional<Hospital> newHospital = hospitalRepository.findById(newHospitalId);
        if(newHospital.isEmpty()){
            fail("Hospital was not created");
        }
        HospitalReq req = objectMapper.readValue(addHospitalReq, HospitalReq.class);
        log.info("New add hospital req: {}", req.toString());
        log.info("New hospital is: {}", newHospital.get());

        assertHospital(req, newHospital.get());

        // Update Hospital Test
        String updateHospitalReq = """
                    {
                      "name": "Gazi Medical College Hospital, Khulna",
                      "description": "A place where history is made",
                      "location": "Sondanga, Khulna, Bangladesh",
                      "contactNumber": "01738222344",
                      "email": "info@gazimedicalcollege.com"
                    }
                """;

        mockMvc.perform(put("/v1/ROLE_ADMIN/hospitals/{newHospitalId}", newHospitalId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", adminToken))
                        .content(updateHospitalReq)).andExpect(status().isNoContent());

        Optional<Hospital> updatedHospital = hospitalRepository.findById(newHospitalId);
        if(updatedHospital.isEmpty()){
            fail("Update Hospital Deleted hospital");
        }
        req = objectMapper.readValue(updateHospitalReq, HospitalReq.class);
        log.info("Update hospital req: {}", req.toString());
        log.info("Updated hospital is: {}", updatedHospital.get());

        assertHospital(req, updatedHospital.get());

        // Add MedicalTest
        String addMedicalTestReq = """
                    {
                      "name": "UltraSonoGraphy",
                      "description": "A very important test for heart patients"
                    }
                """;

        location = mockMvc.perform(post("/v1/ROLE_ADMIN/medical-tests")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", adminToken))
                .content(addMedicalTestReq)).andExpect(status().isCreated())
                .andReturn().getResponse().getHeader("Location");
        log.info("New MedicalTest is created at: {}", location);

        Optional<MedicalTest> newMedicalTest = medicalTestRepository.findById(newMedicalTestId);
        if(newMedicalTest.isEmpty()){
            fail("MedicalTest was not added");
        }
        MedicalTestReq medicalTestReq = objectMapper.readValue(addMedicalTestReq, MedicalTestReq.class);
        log.info("Add medical-test req: {}", medicalTestReq);
        log.info("Added MedicalTest is: {}", newMedicalTest.get());

        assertMedicalTest(medicalTestReq, newMedicalTest.get());

        // Update MedicalTest
        String updateMedicalTestReq = """
                    {
                      "name": "ECG-Advanced",
                      "description": "A very important test for patients"
                    }
                """;

        mockMvc.perform(put("/v1/ROLE_ADMIN/medical-tests/{newMedicalTestId}", newMedicalTestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", adminToken))
                        .content(updateMedicalTestReq)).andExpect(status().isNoContent());

        newMedicalTest = medicalTestRepository.findById(newMedicalTestId);
        if(newMedicalTest.isEmpty()){
            fail("Update MedicalTest deleted the medical test");
        }
        medicalTestReq = objectMapper.readValue(updateMedicalTestReq, MedicalTestReq.class);
        log.info("Update medical-test req: {}", updateMedicalTestReq);
        log.info("Update MedicalTest is: {}", newMedicalTest.get());

        assertMedicalTest(medicalTestReq, newMedicalTest.get());

        // Add HospitalTest
        String addHospitalTestReq = String.format("""
                    {
                      "hospitalId": %d,
                      "testId": %d,
                      "fee": 2000
                    }
                """, newHospitalId, newMedicalTestId);

        location = mockMvc.perform(post("/v1/ROLE_ADMIN/hospitals/tests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", adminToken))
                        .content(addHospitalTestReq)).andExpect(status().isCreated())
                        .andReturn().getResponse().getHeader("Location");
        log.info("New HospitalTest is created at: {}", location);

        Optional<HospitalTest> newHospitalTest = hospitalTestRepository.findById(newHospitalTestId);
        if(newHospitalTest.isEmpty()){
            fail("HospitalTest was not added");
        }
        HospitalTestReq hospitalTestReq = objectMapper.readValue(addHospitalTestReq, HospitalTestReq.class);
        log.info("Add Hospital-test req: {}", hospitalTestReq);
        log.info("Added HospitalTest is: {}", newHospitalTest.get());

        assertHospitalTest(hospitalTestReq, newHospitalTest.get());

        // Update HospitalTest
        Integer fee = 1200;
        mockMvc.perform(put("/v1/ROLE_ADMIN/hospitals/tests/{hospitalTestId}", newHospitalTestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", String.format("Bearer %s", adminToken))
                        .content(String.format("""
                                    {
                                        "fee":%d
                                    }
                                """, fee))).andExpect(status().isNoContent());
        newHospitalTest = hospitalTestRepository.findById(newHospitalTestId);
        if(newHospitalTest.isEmpty()){
            fail("Updated HospitalTest was not deleted");
        }

        log.info("Updated HospitalTest is: {}", newHospitalTest.get());
        assertEquals(hospitalTestReq.getHospitalId(), newHospitalTest.get().getHospital().getId());
        assertEquals(hospitalTestReq.getTestId(), newHospitalTest.get().getTest().getId());
        assertEquals(fee, newHospitalTest.get().getFee());

        // Delete HospitalTest
        mockMvc.perform(delete("/v1/ROLE_ADMIN/hospitals/tests/{hospitalTestId}", newHospitalTestId)
                .header("Authorization", String.format("Bearer %s", adminToken)))
                .andExpect(status().isNoContent());

        if(hospitalTestRepository.existsById(newHospitalTestId)){
            fail("HospitalTest was not deleted");
        }

        // Delete Medical Test
        mockMvc.perform(delete("/v1/ROLE_ADMIN/medical-tests/{newMedicalTestId}", newMedicalTestId)
                        .header("Authorization", String.format("Bearer %s", adminToken)))
                .andExpect(status().isNoContent());

        if(medicalTestRepository.existsById(newMedicalTestId)){
            fail("Medical Test was not deleted");
        }

        // Delete Hospital
        mockMvc.perform(delete("/v1/ROLE_ADMIN/hospitals/{newHospitalId}", newHospitalId)
                        .header("Authorization", String.format("Bearer %s", adminToken)))
                        .andExpect(status().isNoContent());

        if(hospitalRepository.existsById(newHospitalId)){
            fail("Hospital was not deleted");
        }

    }

    @Test
    @Sql("/test/hospitalTest.sql")
    public void queryHospitalMedicalTestHospitalTest() throws Exception {
        String res = mockMvc.perform(get("/v1/anonymous/hospitals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .param("testIds", "1,2")
                        .param("name", "Medical")
                        .param("location", "khulna")
                )
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.page.totalElements").value(1))
                        .andExpect(jsonPath("$.content[0].id").value(2))
                        .andReturn().getResponse().getContentAsString();

        log.info("Get Hospitals result: {}", res);

        res = mockMvc.perform(get("/v1/anonymous/medical-tests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .param("name", "c")
                        .param("desc", "true")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(2))
                .andExpect(jsonPath("$[1].id").value(1))
                .andReturn().getResponse().getContentAsString();

        log.info("Get Medical Test result: {}", res);

        res = mockMvc.perform(get("/v1/anonymous/hospitals/tests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .param("hospitalId", "2")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(2))
                .andExpect(jsonPath("$.content[0].id").value(2))
                .andExpect(jsonPath("$.content[1].id").value(1))
                .andReturn().getResponse().getContentAsString();

        log.info("Get Hospital Tests result: {}", res);

        res = mockMvc.perform(get("/v1/anonymous/hospitals/compare")
                        .contentType(MediaType.APPLICATION_JSON)
                        .param("testId", "1")
                        .param("hospitalIds", "2,3")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$['2']").value(1000))
                .andExpect(jsonPath("$['3']").value(1200))
                .andReturn().getResponse().getContentAsString();

        log.info("Get Hospital Test fess for compare: {}", res);
    }

    public void assertHospital(HospitalReq req, Hospital hospital){
        assertEquals(req.getName(), hospital.getName());
        assertEquals(req.getDescription(), hospital.getDescription());
        assertEquals(req.getLocation(), hospital.getLocation());
        assertEquals(req.getContactNumber(), hospital.getContactNumber());
        assertEquals(req.getEmail(), hospital.getEmail());
    }

    public void assertMedicalTest(MedicalTestReq req, MedicalTest medicalTest){
        assertEquals(req.getName(), medicalTest.getName());
        assertEquals(req.getDescription(), medicalTest.getDescription());
    }

    public void assertHospitalTest(HospitalTestReq req, HospitalTest hospitalTest){
        assertEquals(req.getHospitalId(), hospitalTest.getHospital().getId());
        assertEquals(req.getTestId(), hospitalTest.getTest().getId());
        assertEquals(req.getFee(), hospitalTest.getFee());
    }

    private String mint(Long id, List<Roles> roles){
        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .subject(id.toString())
                .issuer("self")
                .audience(List.of("pinklifeline"))
                .claim("scope", roles)
                .claim("subscribed", false);
        JwtEncoderParameters parameters = JwtEncoderParameters.from(builder.build());
        return this.jwtEncoder.encode(parameters).getTokenValue();
    }
}
