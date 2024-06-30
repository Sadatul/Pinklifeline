package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.exceptions.UserInfoUnregisteredException;
import com.sadi.pinklifeline.service.PatientSpecificFeaturesService;
import org.junit.jupiter.api.Test;
import org.mockito.BDDMockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

@WebMvcTest(controllers = {PatientSpecificFeaturesV1.class})
public class PatientSpecificFeaturesUnitTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PatientSpecificFeaturesService patientService;

    @Test
    @WithMockUser(username = "1", roles = {"PATIENT"})
    public void unknownUserId_404NotFound() throws Exception {
        BDDMockito.given(patientService.getNearbyUsers(1L)).willThrow(new UsernameNotFoundException("User not found"));

        mockMvc.perform(get("/v1/ROLE_PATIENT/nearby/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }

    @Test
    @WithMockUser(username = "1", roles = {"PATIENT"})
    public void whenUserInfoUnregistered_Forbidden() throws Exception {
        BDDMockito.given(patientService.getNearbyUsers(1L)).willThrow(
                new UserInfoUnregisteredException("User needs to register his info first"));

        mockMvc.perform(get("/v1/ROLE_PATIENT/nearby/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isForbidden());
    }
}
