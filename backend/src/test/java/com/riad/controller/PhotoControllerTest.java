package com.riad.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.riad.dto.response.PhotoResponse;
import com.riad.service.PhotoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("PhotoController - Tests Web")
class PhotoControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private PhotoService photoService;

    private PhotoResponse buildPhotoResponse() {
        return new PhotoResponse(1L, "test.jpg", "http://localhost/test.jpg",
                "Test Photo", "Caption", 0, false, 1L, LocalDateTime.now());
    }

    @Test
    @DisplayName("GET /photos/gallery - 200 retourne les photos de galerie")
    void getGallery_Returns200WithGalleryPhotos() throws Exception {
        when(photoService.getGalleryPhotos()).thenReturn(List.of(buildPhotoResponse()));

        mockMvc.perform(get("/api/v1/photos/gallery"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].fileName").value("test.jpg"));
    }

    @Test
    @DisplayName("GET /photos/rooms/{roomId} - 200 retourne les photos d'une chambre")
    void getRoomPhotos_Returns200WithRoomPhotos() throws Exception {
        when(photoService.getRoomPhotos(1L)).thenReturn(List.of(buildPhotoResponse()));

        mockMvc.perform(get("/api/v1/photos/rooms/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(1));
    }

    @Test
    @DisplayName("POST /photos/upload - 401 sans authentification")
    void uploadPhoto_WithoutAuth_Returns401() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg",
                MediaType.IMAGE_JPEG_VALUE, "content".getBytes());

        mockMvc.perform(multipart("/api/v1/photos/upload").file(file))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin@riad.ma", roles = "ADMIN")
    @DisplayName("POST /photos/upload - 201 avec admin authentifié")
    void uploadPhoto_AsAdmin_Returns201() throws Exception {
        when(photoService.uploadPhoto(any(), any(), any(), any(), anyBoolean()))
                .thenReturn(buildPhotoResponse());

        MockMultipartFile file = new MockMultipartFile("file", "test.jpg",
                MediaType.IMAGE_JPEG_VALUE, "valid content".getBytes());

        mockMvc.perform(multipart("/api/v1/photos/upload")
                        .file(file)
                        .param("altText", "Test Alt")
                        .param("isCover", "false"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fileName").value("test.jpg"));
    }

    @Test
    @WithMockUser(username = "guest@test.ma", roles = "GUEST")
    @DisplayName("POST /photos/upload - 403 pour un GUEST")
    void uploadPhoto_AsGuest_Returns403() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg",
                MediaType.IMAGE_JPEG_VALUE, "content".getBytes());

        mockMvc.perform(multipart("/api/v1/photos/upload").file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /photos/{photoId} - 401 sans authentification")
    void deletePhoto_WithoutAuth_Returns401() throws Exception {
        mockMvc.perform(delete("/api/v1/photos/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin@riad.ma", roles = "ADMIN")
    @DisplayName("DELETE /photos/{photoId} - 200 avec admin authentifié")
    void deletePhoto_AsAdmin_Returns200() throws Exception {
        doNothing().when(photoService).deletePhoto(1L);

        mockMvc.perform(delete("/api/v1/photos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "admin@riad.ma", roles = "ADMIN")
    @DisplayName("PATCH /photos/rooms/{roomId}/cover/{photoId} - 200 définit la cover")
    void setCoverPhoto_AsAdmin_Returns200() throws Exception {
        when(photoService.setCoverPhoto(1L, 1L)).thenReturn(buildPhotoResponse());

        mockMvc.perform(patch("/api/v1/photos/rooms/1/cover/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
