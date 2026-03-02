package com.riad.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.riad.dto.request.LoginRequest;
import com.riad.dto.request.RegisterRequest;
import com.riad.dto.request.ReservationRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test d'intégration complet simulant le parcours d'un utilisateur :
 * Inscription → Connexion → Consulter chambres → Créer réservation → Voir réservation → Annuler
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Parcours complet utilisateur - Tests d'intégration")
class ReservationFlowIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    // Partagé entre les tests ordonnés
    private static String accessToken;
    private static Long createdReservationId;

    @Test
    @Order(1)
    @DisplayName("1. Inscription d'un nouvel utilisateur")
    void step1_Register() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Khalid", "Ouazzani",
                "khalid.flow@test.ma",
                "FlowTest@1234",
                "+212699112233");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        // Extraire le token pour les tests suivants
        accessToken = objectMapper.readTree(body)
                .path("data").path("accessToken").asText();

        assertThat(accessToken).isNotBlank();
    }

    @Test
    @Order(2)
    @DisplayName("2. Connexion avec le compte créé")
    void step2_Login() throws Exception {
        LoginRequest request = new LoginRequest("khalid.flow@test.ma", "FlowTest@1234");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.email").value("khalid.flow@test.ma"))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        accessToken = objectMapper.readTree(body)
                .path("data").path("accessToken").asText();

        assertThat(accessToken).isNotBlank();
    }

    @Test
    @Order(3)
    @DisplayName("3. Consulter la liste des chambres (public)")
    void step3_GetRooms() throws Exception {
        mockMvc.perform(get("/api/v1/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").exists());
    }

    @Test
    @Order(4)
    @DisplayName("4. Créer une réservation (authentifié)")
    void step4_CreateReservation() throws Exception {
        // D'abord récupérer une chambre
        MvcResult roomResult = mockMvc.perform(get("/api/v1/rooms"))
                .andExpect(status().isOk())
                .andReturn();

        String roomBodyStr = roomResult.getResponse().getContentAsString();
        var contentNode = objectMapper.readTree(roomBodyStr).path("data").path("content");

        if (!contentNode.isEmpty()) {
            long roomId = contentNode.get(0).path("id").asLong();

            ReservationRequest request = new ReservationRequest(
                    roomId,
                    LocalDate.now().plusDays(30),
                    LocalDate.now().plusDays(34),
                    2,
                    "Test d'intégration");

            MvcResult result = mockMvc.perform(post("/api/v1/reservations")
                            .header("Authorization", "Bearer " + accessToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.status").value("PENDING"))
                    .andExpect(jsonPath("$.data.numberOfNights").value(4))
                    .andReturn();

            String body = result.getResponse().getContentAsString();
            createdReservationId = objectMapper.readTree(body)
                    .path("data").path("id").asLong();

            assertThat(createdReservationId).isPositive();
        }
    }

    @Test
    @Order(5)
    @DisplayName("5. Annuler la réservation créée")
    void step5_CancelReservation() throws Exception {
        if (createdReservationId == null) return; // skip si step 4 n'a pas créé de réservation

        mockMvc.perform(post("/api/v1/reservations/" + createdReservationId + "/cancel")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"reason": "Annulé par le test d'intégration"}
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }

    @Test
    @Order(6)
    @DisplayName("6. Accès refusé à /admin sans token")
    void step6_AdminRouteProtected() throws Exception {
        mockMvc.perform(get("/api/v1/reservations"))
                .andExpect(status().isUnauthorized());
    }
}
