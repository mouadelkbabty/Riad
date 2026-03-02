package com.riad.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.riad.domain.enums.ReservationStatus;
import com.riad.domain.enums.Role;
import com.riad.dto.request.ReservationRequest;
import com.riad.dto.response.ReservationResponse;
import com.riad.dto.response.UserResponse;
import com.riad.service.ReservationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("ReservationController - Tests Web")
class ReservationControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean  private ReservationService reservationService;

    private ReservationResponse buildResponse() {
        UserResponse user = new UserResponse(1L, "Test", "User", "test@test.ma",
                null, Role.GUEST, false, LocalDateTime.now());
        return new ReservationResponse(
                1L, "RIAD-TEST0001", 1L, "Chambre Jasmin", "Standard",
                LocalDate.now().plusDays(10), LocalDate.now().plusDays(14),
                4, 2, BigDecimal.valueOf(3200), ReservationStatus.PENDING,
                null, LocalDateTime.now(), null, null, null, user);
    }

    @Test
    @DisplayName("POST /reservations - 401 sans authentification")
    void createReservation_WithoutAuth_Returns401() throws Exception {
        ReservationRequest request = new ReservationRequest(
                1L, LocalDate.now().plusDays(5), LocalDate.now().plusDays(9), 2, null);

        mockMvc.perform(post("/api/v1/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "test@test.ma", roles = "GUEST")
    @DisplayName("POST /reservations - 201 avec utilisateur authentifié")
    void createReservation_Authenticated_Returns201() throws Exception {
        when(reservationService.createReservation(any(), eq("test@test.ma")))
                .thenReturn(buildResponse());

        ReservationRequest request = new ReservationRequest(
                1L, LocalDate.now().plusDays(5), LocalDate.now().plusDays(9), 2, null);

        mockMvc.perform(post("/api/v1/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reservationNumber").value("RIAD-TEST0001"))
                .andExpect(jsonPath("$.data.status").value("PENDING"));
    }

    @Test
    @WithMockUser(username = "test@test.ma", roles = "GUEST")
    @DisplayName("GET /reservations/my - Retourne les réservations de l'utilisateur")
    void getMyReservations_Authenticated_Returns200() throws Exception {
        when(reservationService.getMyReservations(anyString(), anyInt(), anyInt()))
                .thenReturn(new com.riad.dto.response.PageResponse<>(
                        java.util.List.of(buildResponse()), 0, 10, 1, 1, true, true));

        mockMvc.perform(get("/api/v1/reservations/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].reservationNumber").value("RIAD-TEST0001"));
    }

    @Test
    @WithMockUser(username = "test@test.ma", roles = "GUEST")
    @DisplayName("GET /reservations - 403 pour un GUEST (réservé ADMIN)")
    void getAllReservations_AsGuest_Returns403() throws Exception {
        mockMvc.perform(get("/api/v1/reservations"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@riad.ma", roles = "ADMIN")
    @DisplayName("GET /reservations - 200 pour un ADMIN")
    void getAllReservations_AsAdmin_Returns200() throws Exception {
        when(reservationService.getAllReservations(any(), anyInt(), anyInt()))
                .thenReturn(new com.riad.dto.response.PageResponse<>(
                        java.util.List.of(), 0, 20, 0, 0, true, true));

        mockMvc.perform(get("/api/v1/reservations"))
                .andExpect(status().isOk());
    }
}
