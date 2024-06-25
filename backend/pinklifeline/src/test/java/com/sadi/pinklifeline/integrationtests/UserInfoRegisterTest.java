package com.sadi.pinklifeline.integrationtests;

import com.sadi.pinklifeline.enums.CancerStages;
import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.enums.YesNo;
import com.sadi.pinklifeline.models.BasicUserDetails;
import com.sadi.pinklifeline.models.Medication;
import com.sadi.pinklifeline.models.PatientSpecificDetails;
import com.sadi.pinklifeline.models.User;
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
public class UserInfoRegisterTest extends AbstractBaseIntegrationTest{

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtEncoder jwtEncoder;

    private final Logger logger = LoggerFactory.getLogger(UserInfoRegisterTest.class);


    @Test
    public void givenUser_whenRegisterWithAllInfo_thenSuccess() throws Exception {
        User user = new User("pinklife@example.com",passwordEncoder.encode("12345"), List.of(Roles.ROLE_BASICUSER));
        Long id = userRepository.save(user).getId();
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
        User newUser = userRepository.findById(id).orElseThrow();
        Assertions.assertThat(newUser.getProfilePicture()).isEqualTo("businessman");
        BasicUserDetails basic = user.getBasicUser();
        Assertions.assertThat(basic.getFullName()).isEqualTo("Sadi");
        Assertions.assertThat(basic.getWeight()).isEqualTo(58);
        Assertions.assertThat(basic.getHeight()).isEqualTo(25);
        Assertions.assertThat(basic.getDob()).isEqualTo("2000-08-08");
        Assertions.assertThat(basic.getCancerHistory()).isEqualTo(YesNo.Y);
        Assertions.assertThat(basic.getLastPeriodDate()).isEqualTo("2000-08-08");
        Assertions.assertThat(basic.getAvgCycleLength()).isEqualTo(5);

        String[] relatives = {"Aunt", "Samiha"};
        String[] organsWithChronicCondition = {"Heart", "Throat"};
        String[] periodIrregularities= {"Higher pain", "Longer than average cycles"};
        String[] allergies = {"Peanut"};
        Medication[] medications = {new Medication("Napa Extra", "3 times a day"),
                new Medication("Napa Extra", "3 times a day")};

        assertArrayEquals(relatives, basic.getCancerRelatives().toArray());
        assertArrayEquals(medications, basic.getMedications().toArray());
        assertArrayEquals(organsWithChronicCondition, basic.getOrgansWithChronicCondition().toArray());
        assertArrayEquals(periodIrregularities, basic.getPeriodIrregularities().toArray());
        assertArrayEquals(allergies, basic.getAllergies().toArray());
    }

    @Test
    public void givenPatient_whenRegisterWithAllInfo_thenSuccess() throws Exception {
        User user = new User("pinklife@example.com",
                passwordEncoder.encode("12345"), List.of(Roles.ROLE_PATIENT));
        Long id = userRepository.save(user).getId();
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
        User newUser = userRepository.findById(id).orElseThrow();
        Assertions.assertThat(newUser.getProfilePicture()).isEqualTo("businessman");
        BasicUserDetails basic = user.getBasicUser();
        PatientSpecificDetails patient = user.getPatientSpecificDetails();
        Assertions.assertThat(basic.getFullName()).isEqualTo("Sadi");
        Assertions.assertThat(basic.getWeight()).isEqualTo(58);
        Assertions.assertThat(basic.getHeight()).isEqualTo(25);
        Assertions.assertThat(basic.getDob()).isEqualTo("2000-08-08");
        Assertions.assertThat(basic.getCancerHistory()).isEqualTo(YesNo.Y);
        Assertions.assertThat(basic.getLastPeriodDate()).isEqualTo("2000-08-08");
        Assertions.assertThat(basic.getAvgCycleLength()).isEqualTo(5);
        Assertions.assertThat(patient.getLocation()).isEqualTo("sdfjlsdjflsjfljsf");
        Assertions.assertThat(patient.getCancerStage()).isEqualTo(CancerStages.SURVIVOR);
        Assertions.assertThat(patient.getDiagnosisDate()).isEqualTo("2000-08-08");

        String[] relatives = {"Aunt", "Samiha"};
        String[] organsWithChronicCondition = {"Heart", "Throat"};
        String[] periodIrregularities= {"Higher pain", "Longer than average cycles"};
        String[] allergies = {"Peanut"};
        Medication[] medications = {new Medication("Napa Extra", "3 times a day"),
                new Medication("Napa Extra", "3 times a day")};

        assertArrayEquals(relatives, basic.getCancerRelatives().toArray());
        assertArrayEquals(medications, basic.getMedications().toArray());
        assertArrayEquals(organsWithChronicCondition, basic.getOrgansWithChronicCondition().toArray());
        assertArrayEquals(periodIrregularities, basic.getPeriodIrregularities().toArray());
        assertArrayEquals(allergies, basic.getAllergies().toArray());
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
