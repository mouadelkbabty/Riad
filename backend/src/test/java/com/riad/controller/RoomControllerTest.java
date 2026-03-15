package com.riad.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.riad.domain.enums.RoomType;
import com.riad.dto.request.RoomRequest;
import com.riad.dto.response.RoomResponse;
import com.riad.service.RoomService;
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
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("RoomController - Tests Web")
class RoomControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private RoomService roomService;

    private RoomResponse buildRoomResponse() {
        return new RoomResponse(
                1L, "Suite Andalouse",
                "A luxurious suite", "Une suite luxueuse", "جناح فاخر",
                RoomType.SUITE, "Suite",
                BigDecimal.valueOf(1800), 4, 60, true,
                List.of("WiFi", "Hammam"),
                List.of(), null, null);
    }

    private RoomRequest buildRoomRequest() {
        return new RoomRequest(
                "Suite Andalouse", "A luxurious suite", "Une suite luxueuse", "جناح فاخر",
                RoomType.SUITE, BigDecimal.valueOf(1800), 4, 60,
                List.of("WiFi", "Hammam"));
    }

    @Test
    @DisplayName("GET /rooms - 200 avec liste paginée")
    void getAllRooms_Returns200WithPagedRooms() throws Exception {
        var pageResponse = new com.riad.dto.response.PageResponse<>(
                List.of(buildRoomResponse()), 0, 10, 1, 1, true, true);
        when(roomService.getAllRooms(anyInt(), anyInt(), anyString())).thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].name").value("Suite Andalouse"));
    }

    @Test
    @DisplayName("GET /rooms/{id} - 200 avec chambre existante")
    void getRoomById_ExistingRoom_Returns200() throws Exception {
        when(roomService.getRoomById(1L)).thenReturn(buildRoomResponse());

        mockMvc.perform(get("/api/v1/rooms/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Suite Andalouse"))
                .andExpect(jsonPath("$.data.type").value("SUITE"));
    }

    @Test
    @DisplayName("GET /rooms/available - 200 avec chambres disponibles")
    void getAvailableRooms_Returns200WithAvailableRooms() throws Exception {
        when(roomService.searchAvailableRooms(any(), any(), anyInt()))
                .thenReturn(List.of(buildRoomResponse()));

        mockMvc.perform(get("/api/v1/rooms/available")
                        .param("checkIn", "2026-06-01")
                        .param("checkOut", "2026-06-05")
                        .param("guests", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Suite Andalouse"));
    }

    @Test
    @DisplayName("GET /rooms/filter - 200 avec chambres filtrées")
    void filterRooms_Returns200WithFilteredRooms() throws Exception {
        var pageResponse = new com.riad.dto.response.PageResponse<>(
                List.of(buildRoomResponse()), 0, 10, 1, 1, true, true);
        when(roomService.filterRooms(any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/rooms/filter")
                        .param("minPrice", "1000")
                        .param("maxPrice", "2000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @DisplayName("POST /rooms - 401 sans authentification")
    void createRoom_WithoutAuth_Returns401() throws Exception {
        mockMvc.perform(post("/api/v1/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRoomRequest())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin@riad.ma", roles = "ADMIN")
    @DisplayName("POST /rooms - 201 avec admin authentifié")
    void createRoom_AsAdmin_Returns201() throws Exception {
        when(roomService.createRoom(any())).thenReturn(buildRoomResponse());

        mockMvc.perform(post("/api/v1/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRoomRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Suite Andalouse"));
    }

    @Test
    @WithMockUser(username = "guest@test.ma", roles = "GUEST")
    @DisplayName("POST /rooms - 403 pour un GUEST")
    void createRoom_AsGuest_Returns403() throws Exception {
        mockMvc.perform(post("/api/v1/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRoomRequest())))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@riad.ma", roles = "ADMIN")
    @DisplayName("PUT /rooms/{id} - 200 mise à jour par admin")
    void updateRoom_AsAdmin_Returns200() throws Exception {
        when(roomService.updateRoom(anyLong(), any())).thenReturn(buildRoomResponse());

        mockMvc.perform(put("/api/v1/rooms/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRoomRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "admin@riad.ma", roles = "ADMIN")
    @DisplayName("PATCH /rooms/{id}/toggle-availability - 200 bascule disponibilité")
    void toggleAvailability_AsAdmin_Returns200() throws Exception {
        doNothing().when(roomService).toggleRoomAvailability(1L);

        mockMvc.perform(patch("/api/v1/rooms/1/toggle-availability"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "admin@riad.ma", roles = "ADMIN")
    @DisplayName("DELETE /rooms/{id} - 200 suppression par admin")
    void deleteRoom_AsAdmin_Returns200() throws Exception {
        doNothing().when(roomService).deleteRoom(1L);

        mockMvc.perform(delete("/api/v1/rooms/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /rooms - 400 avec données invalides")
    @WithMockUser(username = "admin@riad.ma", roles = "ADMIN")
    void createRoom_WithInvalidData_Returns400() throws Exception {
        String invalidBody = """
                {"name": "", "type": "SUITE", "pricePerNight": -1}
                """;

        mockMvc.perform(post("/api/v1/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest());
    }
}
