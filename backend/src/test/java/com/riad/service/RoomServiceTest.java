package com.riad.service;

import com.riad.domain.entity.Room;
import com.riad.domain.enums.RoomType;
import com.riad.dto.request.RoomRequest;
import com.riad.dto.response.RoomResponse;
import com.riad.exception.InvalidReservationException;
import com.riad.exception.ResourceNotFoundException;
import com.riad.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RoomService - Tests Unitaires")
class RoomServiceTest {

    @Mock private RoomRepository roomRepository;

    @InjectMocks
    private RoomService roomService;

    private Room testRoom;
    private RoomRequest roomRequest;

    @BeforeEach
    void setUp() {
        testRoom = Room.builder()
                .id(1L).name("Suite Andalouse").type(RoomType.SUITE)
                .description("desc").descriptionFr("desc fr").descriptionAr("وصف")
                .pricePerNight(BigDecimal.valueOf(1800)).capacity(4).surface(60)
                .available(true).amenities(List.of("WiFi", "Hammam")).build();

        roomRequest = new RoomRequest(
                "Suite Andalouse", "desc", "desc fr", "وصف",
                RoomType.SUITE, BigDecimal.valueOf(1800), 4, 60,
                List.of("WiFi", "Hammam"));
    }

    @Test
    @DisplayName("getRoomById() - Retourne la chambre si elle existe")
    void getRoomById_ExistingRoom_ReturnsRoomResponse() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));

        RoomResponse response = roomService.getRoomById(1L);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.name()).isEqualTo("Suite Andalouse");
        assertThat(response.pricePerNight()).isEqualByComparingTo(BigDecimal.valueOf(1800));
    }

    @Test
    @DisplayName("getRoomById() - Exception si chambre inexistante")
    void getRoomById_NonExistingRoom_ThrowsResourceNotFoundException() {
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.getRoomById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("getAllRooms() - Retourne une page de chambres")
    void getAllRooms_ReturnsPagedRooms() {
        when(roomRepository.findByAvailableTrue(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(testRoom)));

        var response = roomService.getAllRooms(0, 10, "pricePerNight");

        assertThat(response.content()).hasSize(1);
        assertThat(response.totalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("createRoom() - Crée et retourne la chambre")
    void createRoom_WithValidRequest_ReturnsCreatedRoom() {
        when(roomRepository.save(any(Room.class))).thenReturn(testRoom);

        RoomResponse response = roomService.createRoom(roomRequest);

        assertThat(response.name()).isEqualTo("Suite Andalouse");
        verify(roomRepository).save(any(Room.class));
    }

    @Test
    @DisplayName("updateRoom() - Met à jour la chambre")
    void updateRoom_ExistingRoom_UpdatesAndReturns() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(roomRepository.save(any())).thenReturn(testRoom);

        RoomResponse response = roomService.updateRoom(1L, roomRequest);

        assertThat(response).isNotNull();
        verify(roomRepository).save(testRoom);
    }

    @Test
    @DisplayName("searchAvailableRooms() - Exception si dates invalides")
    void searchAvailableRooms_WithInvalidDates_ThrowsException() {
        LocalDate checkIn  = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        assertThatThrownBy(() -> roomService.searchAvailableRooms(checkIn, checkOut, 2))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("toggleRoomAvailability() - Bascule la disponibilité")
    void toggleRoomAvailability_ChangesAvailability() {
        boolean initial = testRoom.isAvailable();
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(roomRepository.save(any())).thenReturn(testRoom);

        roomService.toggleRoomAvailability(1L);

        assertThat(testRoom.isAvailable()).isNotEqualTo(initial);
    }
}
