package com.riad.repository;

import com.riad.domain.entity.Room;
import com.riad.domain.enums.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long>, JpaSpecificationExecutor<Room> {

    List<Room> findByAvailableTrue();

    @EntityGraph(attributePaths = {"photos", "amenities"})
    Page<Room> findByAvailableTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"photos", "amenities"})
    Optional<Room> findById(Long id);

    List<Room> findByType(RoomType type);

    @Query("""
            SELECT r FROM Room r
            WHERE r.available = true
            AND r.capacity >= :guests
            AND r.id NOT IN (
                SELECT res.room.id FROM Reservation res
                WHERE res.status NOT IN ('CANCELLED', 'NO_SHOW')
                AND res.checkIn < :checkOut
                AND res.checkOut > :checkIn
            )
            """)
    List<Room> findAvailableRooms(
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("guests") Integer guests);

    @Query("""
            SELECT r FROM Room r
            WHERE r.available = true
            AND (:#{#type} IS NULL OR r.type = :type)
            AND (:minPrice IS NULL OR r.pricePerNight >= :minPrice)
            AND (:maxPrice IS NULL OR r.pricePerNight <= :maxPrice)
            AND (:minCapacity IS NULL OR r.capacity >= :minCapacity)
            """)
    Page<Room> findByFilters(
            @Param("type") RoomType type,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minCapacity") Integer minCapacity,
            Pageable pageable);
}
