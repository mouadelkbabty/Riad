package com.riad.dto.response;

import java.util.List;

public record ChatbotResponse(
        String message,
        String type,
        List<ChatbotRoomInfo> rooms
) {
    public static ChatbotResponse text(String message) {
        return new ChatbotResponse(message, "text", null);
    }

    public static ChatbotResponse withRooms(String message, List<ChatbotRoomInfo> rooms) {
        return new ChatbotResponse(message, "rooms", rooms);
    }
}
