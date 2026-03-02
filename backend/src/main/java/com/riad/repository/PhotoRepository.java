package com.riad.repository;

import com.riad.domain.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {

    List<Photo> findByRoomIdOrderByDisplayOrderAsc(Long roomId);

    List<Photo> findByRoomIsNullOrderByDisplayOrderAsc(); // Photos galerie générale

    Optional<Photo> findByRoomIdAndCoverPhotoTrue(Long roomId);

    void deleteByRoomId(Long roomId);

    long countByRoomId(Long roomId);
}
