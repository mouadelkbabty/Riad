package com.riad.repository;

import com.riad.domain.entity.Reservation;
import com.riad.domain.enums.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long>,
        JpaSpecificationExecutor<Reservation> {

    Optional<Reservation> findByReservationNumber(String reservationNumber);

    Page<Reservation> findByUserId(Long userId, Pageable pageable);

    Page<Reservation> findByUserIdAndStatus(Long userId, ReservationStatus status, Pageable pageable);

    Page<Reservation> findByStatus(ReservationStatus status, Pageable pageable);

    @Query("""
            SELECT r FROM Reservation r
            WHERE r.room.id = :roomId
            AND r.status NOT IN ('CANCELLED', 'NO_SHOW')
            AND r.checkIn < :checkOut
            AND r.checkOut > :checkIn
            """)
    List<Reservation> findConflictingReservations(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut);

    @Query("""
            SELECT COUNT(r) FROM Reservation r
            WHERE r.room.id = :roomId
            AND r.status NOT IN ('CANCELLED', 'NO_SHOW')
            AND r.checkIn < :checkOut
            AND r.checkOut > :checkIn
            AND (:excludeId IS NULL OR r.id <> :excludeId)
            """)
    long countConflicts(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("excludeId") Long excludeId);

    @Query("SELECT DISTINCT r.checkIn, r.checkOut FROM Reservation r " +
            "WHERE r.room.id = :roomId AND r.status NOT IN ('CANCELLED', 'NO_SHOW') " +
            "AND r.checkOut >= :from")
    List<Object[]> findOccupiedDateRanges(
            @Param("roomId") Long roomId,
            @Param("from") LocalDate from);
}
