package com.riad.dto.response;

import java.time.LocalDateTime;

public record PhotoResponse(
        Long id,
        String fileName,
        String fileUrl,
        String altText,
        String caption,
        Integer displayOrder,
        boolean coverPhoto,
        Long roomId,
        LocalDateTime uploadedAt
) {}
