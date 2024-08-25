package com.sadi.pinklifeline.integrationtests;

import com.sadi.pinklifeline.enums.Roles;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.repositories.UserRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Rollback
@Transactional
public class UserInfoUpdateTest extends AbstractBaseIntegrationTest{

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtEncoder jwtEncoder;

    private final Logger logger = LoggerFactory.getLogger(UserInfoUpdateTest.class);

    @Test
    public void profilePictureUpdateTest() throws Exception {
        User user = new User("pinklife@example.com",passwordEncoder.encode("12345"), List.of(Roles.ROLE_BASICUSER));
        Long id = userRepository.save(user).getId();
        String requestBody = """
                {
                  "profilePicture": "hasan"
                }
                """;
        String token = mint(id, List.of(Roles.ROLE_BASICUSER));

        mockMvc.perform(put("/v1/infos/profile_picture/{id}", id).contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", String.format("Bearer %s", token))
                .content(requestBody)).andExpect(status().isNoContent());

        User newUser = userRepository.findById(id).orElseThrow();
        Assertions.assertThat(newUser.getProfilePicture()).isEqualTo("hasan");
    }

    private String mint(Long id, List<Roles> roles){
        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .subject(id.toString())
                .issuer("self")
                .audience(List.of("pinklifeline"))
                .claim("scope", roles)
                .claim("subscribed", 0);
        JwtEncoderParameters parameters = JwtEncoderParameters.from(builder.build());
        return this.jwtEncoder.encode(parameters).getTokenValue();
    }
}
