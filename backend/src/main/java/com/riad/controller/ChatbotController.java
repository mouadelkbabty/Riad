package com.riad.controller;

import com.riad.dto.request.ChatbotMessageRequest;
import com.riad.dto.response.ApiResponse;
import com.riad.dto.response.ChatbotResponse;
import com.riad.dto.response.ChatbotRoomInfo;
import com.riad.service.ChatbotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@Tag(name = "Chatbot", description = "Assistant virtuel du Riad – endpoints publics sécurisés")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @GetMapping("/rooms")
    @Operation(summary = "Lister toutes les chambres (données publiques uniquement)")
    public ResponseEntity<ApiResponse<List<ChatbotRoomInfo>>> getRooms() {
        return ResponseEntity.ok(ApiResponse.success(chatbotService.getAllRooms()));
    }

    @GetMapping("/available-rooms")
    @Operation(summary = "Lister les chambres disponibles (données publiques uniquement)")
    public ResponseEntity<ApiResponse<List<ChatbotRoomInfo>>> getAvailableRooms() {
        return ResponseEntity.ok(ApiResponse.success(chatbotService.getAvailableRooms()));
    }

    @GetMapping("/room/{id}")
    @Operation(summary = "Détail public d'une chambre")
    public ResponseEntity<ApiResponse<ChatbotRoomInfo>> getRoomById(@PathVariable Long id) {
        ChatbotRoomInfo room = chatbotService.getRoomById(id);
        if (room == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(room));
    }

    @PostMapping("/message")
    @Operation(summary = "Envoyer un message à l'assistant virtuel")
    public ResponseEntity<ApiResponse<ChatbotResponse>> sendMessage(
            @Valid @RequestBody ChatbotMessageRequest request) {
        ChatbotResponse response = chatbotService.processMessage(
                request.message(), request.language());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
