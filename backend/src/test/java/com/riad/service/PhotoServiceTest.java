package com.riad.service;

import com.riad.config.StorageProperties;
import com.riad.domain.entity.Photo;
import com.riad.domain.entity.Room;
import com.riad.domain.enums.RoomType;
import com.riad.dto.response.PhotoResponse;
import com.riad.exception.ResourceNotFoundException;
import com.riad.exception.StorageException;
import com.riad.repository.PhotoRepository;
import com.riad.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PhotoService - Tests Unitaires")
class PhotoServiceTest {

    @Mock private PhotoRepository photoRepository;
    @Mock private RoomRepository roomRepository;

    @InjectMocks
    private PhotoService photoService;

    @TempDir
    Path tempDir;

    private Room testRoom;
    private Photo testPhoto;

    @BeforeEach
    void setUp() {
        StorageProperties storageProperties = new StorageProperties(
                tempDir.toString(), 5 * 1024 * 1024L, "jpg,jpeg,png,webp,avif");
        ReflectionTestUtils.setField(photoService, "storageProperties", storageProperties);
        ReflectionTestUtils.setField(photoService, "baseUrl", "http://localhost:8080");

        testRoom = Room.builder()
                .id(1L).name("Chambre Jasmin").type(RoomType.STANDARD)
                .description("desc").descriptionFr("desc fr").descriptionAr("وصف")
                .pricePerNight(BigDecimal.valueOf(800)).capacity(2).surface(25)
                .available(true).build();

        testPhoto = Photo.builder()
                .id(1L).fileName("test.jpg").fileUrl("http://localhost:8080/api/v1/photos/files/rooms/1/test.jpg")
                .altText("Test Photo").displayOrder(0).coverPhoto(false).room(testRoom)
                .uploadedAt(LocalDateTime.now()).build();
    }

    @Test
    @DisplayName("getGalleryPhotos() - Retourne les photos de la galerie")
    void getGalleryPhotos_ReturnsGalleryPhotos() {
        Photo galleryPhoto = Photo.builder()
                .id(2L).fileName("gallery.jpg").fileUrl("http://localhost:8080/api/v1/photos/files/gallery/gallery.jpg")
                .altText("Gallery").displayOrder(0).coverPhoto(false).room(null)
                .uploadedAt(LocalDateTime.now()).build();
        when(photoRepository.findByRoomIsNullOrderByDisplayOrderAsc()).thenReturn(List.of(galleryPhoto));

        List<PhotoResponse> result = photoService.getGalleryPhotos();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).fileName()).isEqualTo("gallery.jpg");
    }

    @Test
    @DisplayName("getRoomPhotos() - Retourne les photos d'une chambre")
    void getRoomPhotos_WhenRoomExists_ReturnsPhotos() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(photoRepository.findByRoomIdOrderByDisplayOrderAsc(1L)).thenReturn(List.of(testPhoto));

        List<PhotoResponse> result = photoService.getRoomPhotos(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getRoomPhotos() - Exception si chambre inexistante")
    void getRoomPhotos_WhenRoomNotFound_ThrowsException() {
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> photoService.getRoomPhotos(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("deletePhoto() - Supprime la photo si elle existe")
    void deletePhoto_WhenPhotoExists_DeletesSuccessfully() {
        when(photoRepository.findById(1L)).thenReturn(Optional.of(testPhoto));

        photoService.deletePhoto(1L);

        verify(photoRepository).delete(testPhoto);
    }

    @Test
    @DisplayName("deletePhoto() - Exception si photo inexistante")
    void deletePhoto_WhenPhotoNotFound_ThrowsException() {
        when(photoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> photoService.deletePhoto(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("setCoverPhoto() - Définit la photo de couverture")
    void setCoverPhoto_WhenValidPhotoAndRoom_SetsCover() {
        testPhoto.setCoverPhoto(false);
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(photoRepository.findById(1L)).thenReturn(Optional.of(testPhoto));
        when(photoRepository.findByRoomIdAndCoverPhotoTrue(1L)).thenReturn(Optional.empty());
        when(photoRepository.save(any(Photo.class))).thenAnswer(inv -> inv.getArgument(0));

        PhotoResponse result = photoService.setCoverPhoto(1L, 1L);

        assertThat(result).isNotNull();
        assertThat(testPhoto.isCoverPhoto()).isTrue();
    }

    @Test
    @DisplayName("setCoverPhoto() - Exception si la photo n'appartient pas à la chambre")
    void setCoverPhoto_WhenPhotoNotBelongsToRoom_ThrowsException() {
        Room otherRoom = Room.builder().id(2L).name("Autre").type(RoomType.SUITE)
                .description("d").descriptionFr("d").descriptionAr("d")
                .pricePerNight(BigDecimal.TEN).capacity(2).surface(20).available(true).build();
        testPhoto.setRoom(otherRoom);
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(photoRepository.findById(1L)).thenReturn(Optional.of(testPhoto));

        assertThatThrownBy(() -> photoService.setCoverPhoto(1L, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("n'appartient pas");
    }

    @Test
    @DisplayName("uploadPhoto() - Exception si fichier vide")
    void uploadPhoto_WhenFileEmpty_ThrowsStorageException() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "", "image/jpeg", new byte[0]);

        assertThatThrownBy(() -> photoService.uploadPhoto(emptyFile, null, "alt", null, false))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("vide");
    }

    @Test
    @DisplayName("uploadPhoto() - Exception si fichier trop grand")
    void uploadPhoto_WhenFileTooLarge_ThrowsStorageException() {
        byte[] largeContent = new byte[6 * 1024 * 1024]; // 6MB
        MockMultipartFile largeFile = new MockMultipartFile("file", "large.jpg", "image/jpeg", largeContent);

        assertThatThrownBy(() -> photoService.uploadPhoto(largeFile, null, "alt", null, false))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("volumineux");
    }

    @Test
    @DisplayName("uploadPhoto() - Exception si type de contenu invalide")
    void uploadPhoto_WhenInvalidContentType_ThrowsStorageException() {
        MockMultipartFile invalidFile = new MockMultipartFile("file", "test.jpg", "application/pdf",
                "content".getBytes());

        assertThatThrownBy(() -> photoService.uploadPhoto(invalidFile, null, "alt", null, false))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("non autorisé");
    }

    @Test
    @DisplayName("uploadPhoto() - Exception si extension non autorisée")
    void uploadPhoto_WhenInvalidExtension_ThrowsStorageException() {
        MockMultipartFile invalidFile = new MockMultipartFile("file", "test.gif", "image/jpeg",
                "content".getBytes());

        assertThatThrownBy(() -> photoService.uploadPhoto(invalidFile, null, "alt", null, false))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("Extension");
    }

    @Test
    @DisplayName("uploadPhoto() - Succès pour une photo de galerie")
    void uploadPhoto_GalleryPhoto_SuccessfullyUploads() {
        MockMultipartFile validFile = new MockMultipartFile("file", "photo.jpg", "image/jpeg",
                "valid image content".getBytes());
        when(photoRepository.findByRoomIsNullOrderByDisplayOrderAsc()).thenReturn(List.of());
        when(photoRepository.save(any(Photo.class))).thenAnswer(inv -> {
            Photo p = inv.getArgument(0);
            p.setId(10L);
            return p;
        });

        PhotoResponse result = photoService.uploadPhoto(validFile, null, "alt", "caption", false);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(10L);
        verify(photoRepository).save(any(Photo.class));
    }

    @Test
    @DisplayName("uploadPhoto() - Succès pour une photo de chambre avec cover")
    void uploadPhoto_RoomPhoto_WithCover_SuccessfullyUploads() {
        MockMultipartFile validFile = new MockMultipartFile("file", "photo.jpg", "image/jpeg",
                "valid image content".getBytes());
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(photoRepository.findByRoomIdAndCoverPhotoTrue(1L)).thenReturn(Optional.empty());
        when(photoRepository.countByRoomId(1L)).thenReturn(0L);
        when(photoRepository.save(any(Photo.class))).thenAnswer(inv -> {
            Photo p = inv.getArgument(0);
            p.setId(11L);
            return p;
        });

        PhotoResponse result = photoService.uploadPhoto(validFile, 1L, "alt", null, true);

        assertThat(result).isNotNull();
        assertThat(result.coverPhoto()).isTrue();
    }

    @Test
    @DisplayName("uploadPhoto() - Remplace l'ancienne cover lors d'un nouvel upload")
    void uploadPhoto_WithExistingCover_ReplacesCoverPhoto() {
        MockMultipartFile validFile = new MockMultipartFile("file", "photo.jpg", "image/jpeg",
                "valid image content".getBytes());
        Photo existingCover = Photo.builder().id(5L).fileName("old.jpg")
                .fileUrl("http://localhost/old.jpg").altText("old").coverPhoto(true)
                .room(testRoom).uploadedAt(LocalDateTime.now()).build();
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(photoRepository.findByRoomIdAndCoverPhotoTrue(1L)).thenReturn(Optional.of(existingCover));
        when(photoRepository.save(any(Photo.class))).thenAnswer(inv -> {
            Photo p = inv.getArgument(0);
            if (p.getId() == null) p.setId(12L);
            return p;
        });
        when(photoRepository.countByRoomId(1L)).thenReturn(1L);

        PhotoResponse result = photoService.uploadPhoto(validFile, 1L, "alt", null, true);

        assertThat(result).isNotNull();
        assertThat(existingCover.isCoverPhoto()).isFalse();
        verify(photoRepository, times(2)).save(any(Photo.class));
    }
}
