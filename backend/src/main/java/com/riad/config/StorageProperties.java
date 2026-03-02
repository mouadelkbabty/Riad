package com.riad.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "application.storage")
public record StorageProperties(
        String uploadDir,
        long maxFileSize,
        String allowedExtensions
) {
    public String[] allowedExtensionArray() {
        return allowedExtensions.split(",");
    }
}
