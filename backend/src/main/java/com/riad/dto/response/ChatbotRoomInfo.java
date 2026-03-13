package com.riad.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ChatbotRoomInfo(
        Long id,
        String name,
        String description,
        String type,
        BigDecimal pricePerNight,
        Integer capacity,
        Integer surface,
        boolean available,
        List<String> amenities,
        String coverPhotoUrl
) {}
