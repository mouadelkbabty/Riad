package com.riad.service;

import com.riad.domain.entity.Room;
import com.riad.domain.enums.RoomType;
import com.riad.dto.request.RoomRequest;
import com.riad.dto.response.PageResponse;
import com.riad.dto.response.PhotoResponse;
import com.riad.dto.response.RoomResponse;
import com.riad.exception.ResourceNotFoundException;
import com.riad.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository roomRepository;

    public PageResponse<RoomResponse> getAllRooms(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());
        return PageResponse.from(roomRepository.findByAvailableTrue(pageable)
                .map(this::toRoomResponse));
    }

    public RoomResponse getRoomById(Long id) {
        return roomRepository.findById(id)
                .map(this::toRoomResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre", id));
    }

    public List<RoomResponse> searchAvailableRooms(LocalDate checkIn, LocalDate checkOut, Integer guests) {
        validateDates(checkIn, checkOut);
        return roomRepository.findAvailableRooms(checkIn, checkOut, guests)
                .stream().map(this::toRoomResponse).toList();
    }

    public PageResponse<RoomResponse> filterRooms(RoomType type, BigDecimal minPrice,
                                                   BigDecimal maxPrice, Integer minCapacity,
                                                   int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("pricePerNight").ascending());
        return PageResponse.from(
                roomRepository.findByFilters(type, minPrice, maxPrice, minCapacity, pageable)
                        .map(this::toRoomResponse));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public RoomResponse createRoom(RoomRequest request) {
        Room room = Room.builder()
                .name(request.name())
                .description(request.description())
                .descriptionFr(request.descriptionFr())
                .descriptionAr(request.descriptionAr())
                .type(request.type())
                .pricePerNight(request.pricePerNight())
                .capacity(request.capacity())
                .surface(request.surface())
                .amenities(request.amenities() != null ? request.amenities() : List.of())
                .build();
        Room saved = roomRepository.save(room);
        log.info("Chambre créée: {} (ID: {})", saved.getName(), saved.getId());
        return toRoomResponse(saved);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre", id));

        room.setName(request.name());
        room.setDescription(request.description());
        room.setDescriptionFr(request.descriptionFr());
        room.setDescriptionAr(request.descriptionAr());
        room.setType(request.type());
        room.setPricePerNight(request.pricePerNight());
        room.setCapacity(request.capacity());
        room.setSurface(request.surface());
        if (request.amenities() != null) {
            room.getAmenities().clear();
            room.getAmenities().addAll(request.amenities());
        }
        Room updated = roomRepository.save(room);
        log.info("Chambre mise à jour: {} (ID: {})", updated.getName(), updated.getId());
        return toRoomResponse(updated);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void toggleRoomAvailability(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre", id));
        room.setAvailable(!room.isAvailable());
        roomRepository.save(room);
        log.info("Disponibilité de chambre {} changée à: {}", id, room.isAvailable());
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre", id));
        roomRepository.delete(room);
        log.info("Chambre supprimée: ID {}", id);
    }

    private void validateDates(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            throw new IllegalArgumentException("Les dates sont obligatoires");
        }
        if (!checkIn.isBefore(checkOut)) {
            throw new IllegalArgumentException("La date d'arrivée doit être avant la date de départ");
        }
        if (checkIn.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La date d'arrivée ne peut pas être dans le passé");
        }
    }

    public RoomResponse toRoomResponse(Room room) {
        List<PhotoResponse> photos = room.getPhotos().stream()
                .map(p -> new PhotoResponse(p.getId(), p.getFileName(), p.getFileUrl(),
                        p.getAltText(), p.getCaption(), p.getDisplayOrder(), p.isCoverPhoto(),
                        room.getId(), p.getUploadedAt()))
                .toList();

        PhotoResponse coverPhoto = photos.stream()
                .filter(PhotoResponse::coverPhoto)
                .findFirst()
                .orElse(photos.isEmpty() ? null : photos.get(0));

        return new RoomResponse(
                room.getId(),
                room.getName(),
                room.getDescription(),
                room.getDescriptionFr(),
                room.getDescriptionAr(),
                room.getType(),
                room.getType().getLabel(),
                room.getPricePerNight(),
                room.getCapacity(),
                room.getSurface(),
                room.isAvailable(),
                room.getAmenities(),
                photos,
                coverPhoto);
    }
}
