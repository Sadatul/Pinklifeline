package com.sadi.pinklifeline.integrationtests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.*;
import com.sadi.pinklifeline.repositories.UserRepository;
import static org.junit.jupiter.api.Assertions.*;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Rollback
@Transactional
public class UserInfoRegisterAndUpdateTest extends AbstractBaseIntegrationTest{

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private final Logger logger = LoggerFactory.getLogger(UserInfoRegisterAndUpdateTest.class);


    @Test
    public void basicUserInfoRegisterThenUpdateTest() throws Exception {
        User user = new User("pinklife@example.com",passwordEncoder.encode("12345"), List.of(Roles.ROLE_BASICUSER));
        Long id = userRepository.save(user).getId();
        // Register Request
        String requestBody = """
                {
                	"fullName": "Sadi",
                	"weight": 58,
                	"height": 25,
                	"dob": "2000-08-08",
                	"cancerHistory": "Y",
                  	"cancerRelatives": ["Aunt", "Samiha"],
                	"profilePicture": "businessman",
                	"lastPeriodDate": "2000-08-08",
                	"avgCycleLength": 5,
                	"periodIrregularities": ["Higher pain", "Longer than average cycles"],
                	"allergies": ["Peanut"],
                	"organsWithChronicCondition": ["Heart", "Throat"],
                	"medications": [{"name": "Napa Extra", "doseDescription": "3 times a day"},
                                    {"name": "Napa Extra", "doseDescription": "3 times a day"}]
                }
                """;
        String token = mint(id, List.of(Roles.ROLE_BASICUSER));

        mockMvc.perform(post("/v1/register/ROLE_BASICUSER/{id}", id).contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", token))
                .content(requestBody)).andExpect(status().isNoContent());
        BasicUserInfoRegisterReq req = objectMapper.readValue(requestBody, BasicUserInfoRegisterReq.class);
        User newUser = userRepository.findById(id).orElseThrow();
        assertThatBasicInfosAreCorrect(req, newUser);
        // Update Request
        String updateBody = """
                {
                	"fullName": "Sadatul",
                	"weight": 55,
                	"height": 25,
                	"cancerHistory": "N",
                	"lastPeriodDate": "2000-07-08",
                	"avgCycleLength": 5,
                	"periodIrregularities": [],
                	"allergies": ["Peanut"],
                	"organsWithChronicCondition": ["Heart", "Throat", "Lung"],
                	"medications": [{"name": "Napa Extra", "doseDescription": "3 times a day"},
                                    {"name": "Napa Extend", "doseDescription": "3 times a day"}]
                }
                """;
        mockMvc.perform(post("/v1/update/ROLE_BASICUSER/{id}", id).contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", token))
                .content(updateBody)).andExpect(status().isNoContent());

        BasicUserInfoUpdateReq updateReq = objectMapper.readValue(updateBody, BasicUserInfoUpdateReq.class);
        newUser = userRepository.findById(id).orElseThrow();
        assertThatBasicUpdateIsCorrect(updateReq, newUser);

        // The rest of the data stays same Test
        assertEquals(req.getProfilePicture(), newUser.getProfilePicture());
        assertEquals(req.getDob(), newUser.getBasicUser().getDob());
    }

    @Test
    public void basicPatientInfoRegisterThenUpdateTest() throws Exception {
        User user = new User("pinklife@example.com",
                passwordEncoder.encode("12345"), List.of(Roles.ROLE_PATIENT));
        Long id = userRepository.save(user).getId();
        // Register Request
        String requestBody = """
                {
                	"fullName": "Sadi",
                	"weight": 58,
                	"height": 25,
                	"dob": "2000-08-08",
                	"cancerHistory": "Y",
                  	"cancerRelatives": ["Aunt", "Samiha"],
                	"profilePicture": "businessman",
                	"lastPeriodDate": "2000-08-08",
                	"avgCycleLength": 5,
                	"periodIrregularities": ["Higher pain", "Longer than average cycles"],
                	"allergies": ["Peanut"],
                	"cancerStage": "SURVIVOR",
                   	"diagnosisDate": "2000-08-08",
                   	"location": "sdfjlsdjflsjfljsf",
                	"organsWithChronicCondition": ["Heart", "Throat"],
                	"medications": [{"name": "Napa Extra", "doseDescription": "3 times a day"},
                                    {"name": "Napa Extra", "doseDescription": "3 times a day"}]
                }
                """;
        String token = mint(id, List.of(Roles.ROLE_PATIENT));
        mockMvc.perform(post("/v1/register/ROLE_PATIENT/{id}", id).contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", token))
                .content(requestBody)).andExpect(status().isNoContent());

        PatientInfoRegisterReq req = objectMapper.readValue(requestBody, PatientInfoRegisterReq.class);

        User newUser = userRepository.findById(id).orElseThrow();
        assertThatBasicInfosAreCorrect(req, newUser);
        assertThatPatientInfosAreCorrect(req, newUser);

        // Update Request
        String updateBody = """
                {
                	"fullName": "Sadatul",
                	"weight": 55,
                	"height": 25,
                	"cancerHistory": "N",
                	"lastPeriodDate": "2000-07-08",
                	"avgCycleLength": 5,
                	"periodIrregularities": [],
                	"allergies": ["Peanut"],
                	"cancerStage": "STAGE_1",
                   	"diagnosisDate": "2000-09-08",
                	"organsWithChronicCondition": ["Heart", "Throat", "Lung"],
                	"medications": [{"name": "Napa Extra", "doseDescription": "3 times a day"},
                                    {"name": "Napa Extend", "doseDescription": "3 times a day"}]
                }
                """;
        mockMvc.perform(post("/v1/update/ROLE_PATIENT/{id}", id).contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", token))
                .content(updateBody)).andExpect(status().isNoContent());

        PatientInfoUpdateReq updateReq = objectMapper.readValue(updateBody, PatientInfoUpdateReq.class);
        newUser = userRepository.findById(id).orElseThrow();
        assertThatBasicUpdateIsCorrect(updateReq, newUser);
        assertThatPatientUpdateIsCorrect(updateReq, newUser);

        // The rest of the data stays same Test
        assertEquals(req.getProfilePicture(), newUser.getProfilePicture());
        assertEquals(req.getDob(), newUser.getBasicUser().getDob());
        assertEquals(req.getLocation(), newUser.getPatientSpecificDetails().getLocation());

    }

    private void assertThatBasicInfosAreCorrect(AbstractUserInfoRegisterReq req, User user){
        Assertions.assertThat(user.getProfilePicture()).isEqualTo(req.getProfilePicture());
        BasicUserDetails basic = user.getBasicUser();
        Assertions.assertThat(basic.getFullName()).isEqualTo(req.getFullName());
        Assertions.assertThat(basic.getWeight()).isEqualTo(req.getWeight());
        Assertions.assertThat(basic.getHeight()).isEqualTo(req.getHeight());
        Assertions.assertThat(basic.getDob()).isEqualTo(req.getDob());
        Assertions.assertThat(basic.getCancerHistory()).isEqualTo(req.getCancerHistory());
        Assertions.assertThat(basic.getLastPeriodDate()).isEqualTo(req.getLastPeriodDate());
        Assertions.assertThat(basic.getAvgCycleLength()).isEqualTo(req.getAvgCycleLength());
        assertArrayEquals(req.getCancerRelatives().toArray(), basic.getCancerRelatives().toArray());
        assertArrayEquals(req.getMedications().toArray(), basic.getMedications().toArray());
        assertArrayEquals(req.getOrgansWithChronicCondition().toArray(), basic.getOrgansWithChronicCondition().toArray());
        assertArrayEquals(req.getPeriodIrregularities().toArray(), basic.getPeriodIrregularities().toArray());
        assertArrayEquals(req.getAllergies().toArray(), basic.getAllergies().toArray());
    }

    private void assertThatBasicUpdateIsCorrect(AbstractUserInfoUpdateReq req, User user){
        BasicUserDetails basic = user.getBasicUser();
        Assertions.assertThat(basic.getFullName()).isEqualTo(req.getFullName());
        Assertions.assertThat(basic.getWeight()).isEqualTo(req.getWeight());
        Assertions.assertThat(basic.getHeight()).isEqualTo(req.getHeight());
        Assertions.assertThat(basic.getCancerHistory()).isEqualTo(req.getCancerHistory());
        Assertions.assertThat(basic.getLastPeriodDate()).isEqualTo(req.getLastPeriodDate());
        Assertions.assertThat(basic.getAvgCycleLength()).isEqualTo(req.getAvgCycleLength());
        assertArrayEquals(req.getCancerRelatives().toArray(), basic.getCancerRelatives().toArray());
        assertArrayEquals(req.getMedications().toArray(), basic.getMedications().toArray());
        assertArrayEquals(req.getOrgansWithChronicCondition().toArray(), basic.getOrgansWithChronicCondition().toArray());
        assertArrayEquals(req.getPeriodIrregularities().toArray(), basic.getPeriodIrregularities().toArray());
        assertArrayEquals(req.getAllergies().toArray(), basic.getAllergies().toArray());
    }
    private void assertThatPatientInfosAreCorrect(PatientInfoRegisterReq req, User user){
        PatientSpecificDetails patient = user.getPatientSpecificDetails();
        Assertions.assertThat(patient.getLocation()).isEqualTo(req.getLocation());
        Assertions.assertThat(patient.getCancerStage()).isEqualTo(req.getCancerStage());
        Assertions.assertThat(patient.getDiagnosisDate()).isEqualTo(req.getDiagnosisDate());
    }
    private void assertThatPatientUpdateIsCorrect(PatientInfoUpdateReq req, User user){
        PatientSpecificDetails patient = user.getPatientSpecificDetails();
        Assertions.assertThat(patient.getCancerStage()).isEqualTo(req.getCancerStage());
        Assertions.assertThat(patient.getDiagnosisDate()).isEqualTo(req.getDiagnosisDate());
    }

    private String mint(Long id, List<Roles> roles){
        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .subject(id.toString())
                .issuer("self")
                .audience(List.of("pinklifeline"))
                .claim("scope", roles);
        JwtEncoderParameters parameters = JwtEncoderParameters.from(builder.build());
        return this.jwtEncoder.encode(parameters).getTokenValue();
    }
}
