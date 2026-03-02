package com.riad.service;

import com.riad.config.StorageProperties;
import com.riad.domain.entity.Photo;
import com.riad.domain.entity.Room;
import com.riad.dto.response.PhotoResponse;
import com.riad.exception.ResourceNotFoundException;
import com.riad.exception.StorageException;
import com.riad.repository.PhotoRepository;
import com.riad.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PhotoService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_EXTENSIONS = List.of("jpg", "jpeg", "png", "webp", "avif");
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp", "image/avif");

    private final PhotoRepository photoRepository;
    private final RoomRepository roomRepository;
    private final StorageProperties storageProperties;

    @Value("${application.base-url}")
    private String baseUrl;

    @PreAuthorize("hasRole('ADMIN')")
    public PhotoResponse uploadPhoto(MultipartFile file, Long roomId,
                                     String altText, String caption, boolean isCover) {
        validateFile(file);

        Room room = null;
        if (roomId != null) {
            room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new ResourceNotFoundException("Chambre", roomId));
        }

        String fileName = generateUniqueFileName(file.getOriginalFilename());
        String subDir = roomId != null ? "rooms/" + roomId : "gallery";
        Path filePath = saveFile(file, subDir, fileName);
        String fileUrl = baseUrl + "/api/v1/photos/files/" + subDir + "/" + fileName;

        // Si c'est une photo de couverture, retirer l'ancienne
        if (isCover && roomId != null) {
            photoRepository.findByRoomIdAndCoverPhotoTrue(roomId).ifPresent(existing -> {
                existing.setCoverPhoto(false);
                photoRepository.save(existing);
            });
        }

        long displayOrder = roomId != null
                ? photoRepository.countByRoomId(roomId)
                : photoRepository.findByRoomIsNullOrderByDisplayOrderAsc().size();

        Photo photo = Photo.builder()
                .fileName(fileName)
                .fileUrl(fileUrl)
                .altText(altText != null ? altText : fileName)
                .caption(caption)
                .displayOrder((int) displayOrder)
                .coverPhoto(isCover)
                .room(room)
                .build();

        Photo saved = photoRepository.save(photo);
        log.info("Photo uploadée: {} ({})", fileName, roomId != null ? "chambre " + roomId : "galerie générale");

        return toPhotoResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PhotoResponse> getGalleryPhotos() {
        return photoRepository.findByRoomIsNullOrderByDisplayOrderAsc()
                .stream().map(this::toPhotoResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PhotoResponse> getRoomPhotos(Long roomId) {
        roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre", roomId));
        return photoRepository.findByRoomIdOrderByDisplayOrderAsc(roomId)
                .stream().map(this::toPhotoResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deletePhoto(Long photoId) {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", photoId));

        deletePhysicalFile(photo.getFileName(), photo.getRoom() != null ? photo.getRoom().getId() : null);
        photoRepository.delete(photo);
        log.info("Photo supprimée: ID {}", photoId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public PhotoResponse setCoverPhoto(Long roomId, Long photoId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre", roomId));

        Photo newCover = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", photoId));

        if (newCover.getRoom() == null || !newCover.getRoom().getId().equals(roomId)) {
            throw new IllegalArgumentException("Cette photo n'appartient pas à la chambre spécifiée");
        }

        // Retirer l'ancienne cover
        photoRepository.findByRoomIdAndCoverPhotoTrue(roomId).ifPresent(old -> {
            old.setCoverPhoto(false);
            photoRepository.save(old);
        });

        newCover.setCoverPhoto(true);
        Photo updated = photoRepository.save(newCover);
        return toPhotoResponse(updated);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new StorageException("Le fichier est vide ou absent");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new StorageException("Fichier trop volumineux. Maximum: 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new StorageException("Type de fichier non autorisé. Types acceptés: JPG, PNG, WebP, AVIF");
        }

        String ext = FilenameUtils.getExtension(file.getOriginalFilename());
        if (ext == null || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new StorageException("Extension de fichier non autorisée: " + ext);
        }
    }

    private Path saveFile(MultipartFile file, String subDir, String fileName) {
        try {
            Path uploadPath = Paths.get(storageProperties.uploadDir(), subDir);
            Files.createDirectories(uploadPath);
            Path destination = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return destination;
        } catch (IOException e) {
            throw new StorageException("Erreur lors de la sauvegarde du fichier: " + e.getMessage(), e);
        }
    }

    private void deletePhysicalFile(String fileName, Long roomId) {
        try {
            String subDir = roomId != null ? "rooms/" + roomId : "gallery";
            Path filePath = Paths.get(storageProperties.uploadDir(), subDir, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Impossible de supprimer le fichier physique: {}", fileName);
        }
    }

    private String generateUniqueFileName(String originalName) {
        String ext = FilenameUtils.getExtension(originalName);
        return UUID.randomUUID() + "." + ext.toLowerCase();
    }

    public PhotoResponse toPhotoResponse(Photo p) {
        return new PhotoResponse(
                p.getId(), p.getFileName(), p.getFileUrl(), p.getAltText(),
                p.getCaption(), p.getDisplayOrder(), p.isCoverPhoto(),
                p.getRoom() != null ? p.getRoom().getId() : null,
                p.getUploadedAt());
    }
}
