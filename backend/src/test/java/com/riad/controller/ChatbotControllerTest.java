package com.riad.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.riad.dto.response.ChatbotResponse;
import com.riad.dto.response.ChatbotRoomInfo;
import com.riad.service.ChatbotService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("ChatbotController - Tests Web")
class ChatbotControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private ChatbotService chatbotService;

    private ChatbotRoomInfo buildRoomInfo() {
        return new ChatbotRoomInfo(1L, "Suite Andalouse", "Description EN", "Suite",
                BigDecimal.valueOf(1800), 4, 60, true, List.of("WiFi"), null);
    }

    @Test
    @DisplayName("GET /chatbot/rooms - 200 retourne toutes les chambres")
    void getRooms_Returns200WithAllRooms() throws Exception {
        when(chatbotService.getAllRooms()).thenReturn(List.of(buildRoomInfo()));

        mockMvc.perform(get("/api/chatbot/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Suite Andalouse"));
    }

    @Test
    @DisplayName("GET /chatbot/available-rooms - 200 retourne les chambres disponibles")
    void getAvailableRooms_Returns200() throws Exception {
        when(chatbotService.getAvailableRooms()).thenReturn(List.of(buildRoomInfo()));

        mockMvc.perform(get("/api/chatbot/available-rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].available").value(true));
    }

    @Test
    @DisplayName("GET /chatbot/room/{id} - 200 retourne la chambre")
    void getRoomById_WhenExists_Returns200() throws Exception {
        when(chatbotService.getRoomById(1L)).thenReturn(buildRoomInfo());

        mockMvc.perform(get("/api/chatbot/room/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Suite Andalouse"));
    }

    @Test
    @DisplayName("GET /chatbot/room/{id} - 404 si chambre inexistante")
    void getRoomById_WhenNotFound_Returns404() throws Exception {
        when(chatbotService.getRoomById(99L)).thenReturn(null);

        mockMvc.perform(get("/api/chatbot/room/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /chatbot/message - 200 traite le message")
    void sendMessage_Returns200WithResponse() throws Exception {
        when(chatbotService.processMessage(anyString(), anyString()))
                .thenReturn(new ChatbotResponse("Bienvenue au Riad!", "text", null));

        String body = """
                {"message": "Bonjour", "language": "fr"}
                """;

        mockMvc.perform(post("/api/chatbot/message")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.type").value("text"))
                .andExpect(jsonPath("$.data.message").value("Bienvenue au Riad!"));
    }
}
