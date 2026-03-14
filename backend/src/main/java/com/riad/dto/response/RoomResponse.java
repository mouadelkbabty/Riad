package com.riad.dto.response;

import com.riad.domain.enums.RoomType;

import java.math.BigDecimal;
import java.util.List;

public record RoomResponse(
                Long id,
                String name,
                String description,
                String descriptionFr,
                String descriptionAr,
                RoomType type,
                String typeName,
                BigDecimal pricePerNight,
                Integer capacity,
                Integer surface,
                boolean available,
                List<String> amenities,
                List<PhotoResponse> photos,
                PhotoResponse coverPhoto,
                String coverPhotoUrl) {
}
