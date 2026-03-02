package com.riad.controller;

import com.riad.dto.response.ApiResponse;
import com.riad.dto.response.PhotoResponse;
import com.riad.service.PhotoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/v1/photos")
@RequiredArgsConstructor
@Tag(name = "Photos", description = "Gestion des photos du Riad et des chambres")
public class PhotoController {

    private final PhotoService photoService;

    @Value("${application.storage.upload-dir}")
    private String uploadDir;

    // ========== PUBLIC ==========

    @GetMapping("/gallery")
    @Operation(summary = "Photos de la galerie générale du Riad")
    public ResponseEntity<ApiResponse<List<PhotoResponse>>> getGallery() {
        return ResponseEntity.ok(ApiResponse.success(photoService.getGalleryPhotos()));
    }

    @GetMapping("/rooms/{roomId}")
    @Operation(summary = "Photos d'une chambre spécifique")
    public ResponseEntity<ApiResponse<List<PhotoResponse>>> getRoomPhotos(@PathVariable Long roomId) {
        return ResponseEntity.ok(ApiResponse.success(photoService.getRoomPhotos(roomId)));
    }

    @GetMapping("/files/**")
    @Operation(summary = "Servir un fichier image")
    public ResponseEntity<Resource> serveFile(@RequestParam String path) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(path).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(filePath.toString());
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ========== ADMIN ==========

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "[ADMIN] Uploader une photo (galerie ou chambre)")
    public ResponseEntity<ApiResponse<PhotoResponse>> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false, defaultValue = "") String altText,
            @RequestParam(required = false, defaultValue = "") String caption,
            @RequestParam(defaultValue = "false") boolean isCover) {
        PhotoResponse response = photoService.uploadPhoto(file, roomId, altText, caption, isCover);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Photo uploadée avec succès"));
    }

    @DeleteMapping("/{photoId}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "[ADMIN] Supprimer une photo")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(@PathVariable Long photoId) {
        photoService.deletePhoto(photoId);
        return ResponseEntity.ok(ApiResponse.success(null, "Photo supprimée avec succès"));
    }

    @PatchMapping("/rooms/{roomId}/cover/{photoId}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "[ADMIN] Définir la photo de couverture d'une chambre")
    public ResponseEntity<ApiResponse<PhotoResponse>> setCoverPhoto(
            @PathVariable Long roomId,
            @PathVariable Long photoId) {
        return ResponseEntity.ok(ApiResponse.success(
                photoService.setCoverPhoto(roomId, photoId), "Photo de couverture mise à jour"));
    }

    private String determineContentType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".avif")) return "image/avif";
        return "image/jpeg";
    }
}
