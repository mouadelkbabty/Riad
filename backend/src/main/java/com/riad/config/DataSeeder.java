package com.riad.config;

import com.riad.domain.entity.Photo;
import com.riad.domain.entity.Room;
import com.riad.domain.entity.User;
import com.riad.domain.entity.Reservation;
import com.riad.domain.enums.ReservationStatus;
import com.riad.domain.enums.Role;
import com.riad.domain.enums.RoomType;
import com.riad.repository.RoomRepository;
import com.riad.repository.ReservationRepository;
import com.riad.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

        @Bean
        public CommandLineRunner seedData(UserRepository userRepository,
                        RoomRepository roomRepository,
                        ReservationRepository reservationRepository,
                        PasswordEncoder passwordEncoder) {
                return args -> {
                        if (userRepository.count() > 0) {
                                log.info("Données déjà initialisées, skip.");
                                return;
                        }

                        log.info("=== Initialisation des données de développement ===");

                        // ── Admin
                        User admin = User.builder()
                                        .firstName("Admin")
                                        .lastName("Riad")
                                        .email("admin@riad.ma")
                                        .password(passwordEncoder.encode("Admin@1234"))
                                        .phone("+212600000001")
                                        .role(Role.ADMIN)
                                        .enabled(true)
                                        .emailVerified(true)
                                        .build();
                        userRepository.save(admin);

                        // ── Utilisateur test
                        User guest = User.builder()
                                        .firstName("Fatima")
                                        .lastName("Benali")
                                        .email("guest@riad.ma")
                                        .password(passwordEncoder.encode("Guest@1234"))
                                        .phone("+212600000002")
                                        .role(Role.GUEST)
                                        .enabled(true)
                                        .emailVerified(true)
                                        .build();
                        userRepository.save(guest);

                        // ── Chambres
                        Room chambre1 = Room.builder()
                                        .name("Chambre Jasmin")
                                        .description("A charming standard room with traditional Moroccan decor.")
                                        .descriptionFr("Une charmante chambre standard avec une décoration marocaine traditionnelle.")
                                        .descriptionAr("غرفة قياسية ساحرة بديكور مغربي تقليدي")
                                        .type(RoomType.STANDARD)
                                        .pricePerNight(BigDecimal.valueOf(800))
                                        .capacity(2)
                                        .surface(25)
                                        .available(true)
                                        .amenities(new LinkedHashSet<>(
                                                        List.of("WiFi", "Climatisation", "Salle de bain privée",
                                                                        "Vue sur patio")))
                                        .build();
                        addPhoto(chambre1, "jasmin-cover.jpg", "https://picsum.photos/seed/jasmin/1200/800",
                                        "Chambre Jasmin", true);
                        addPhoto(chambre1, "jasmin-2.jpg", "https://picsum.photos/seed/jasmin2/1200/800",
                                        "Salle de bain Jasmin", false);

                        Room chambre2 = Room.builder()
                                        .name("Suite Andalouse")
                                        .description("A luxurious suite with stunning views of the medina.")
                                        .descriptionFr("Une suite luxueuse avec une vue imprenable sur la médina.")
                                        .descriptionAr("جناح فاخر مع إطلالة رائعة على المدينة العتيقة")
                                        .type(RoomType.SUITE)
                                        .pricePerNight(BigDecimal.valueOf(1800))
                                        .capacity(4)
                                        .surface(60)
                                        .available(true)
                                        .amenities(new LinkedHashSet<>(List.of("WiFi", "Climatisation", "Hammam privé",
                                                        "Salon", "Terrasse",
                                                        "Service de chambre", "Baignoire")))
                                        .build();
                        addPhoto(chambre2, "andalouse-cover.jpg", "https://picsum.photos/seed/andalouse/1200/800",
                                        "Suite Andalouse", true);
                        addPhoto(chambre2, "andalouse-2.jpg", "https://picsum.photos/seed/andalouse2/1200/800",
                                        "Salon Andalouse", false);
                        addPhoto(chambre2, "andalouse-3.jpg", "https://picsum.photos/seed/andalouse3/1200/800",
                                        "Terrasse Andalouse", false);

                        Room chambre3 = Room.builder()
                                        .name("Suite Royale Atlas")
                                        .description("The crown jewel of the Riad - a royal suite with a private pool.")
                                        .descriptionFr("Le joyau de la couronne du Riad - une suite royale avec piscine privée.")
                                        .descriptionAr("درة تاج الرياض - جناح ملكي مع مسبح خاص")
                                        .type(RoomType.SUITE_ROYALE)
                                        .pricePerNight(BigDecimal.valueOf(3500))
                                        .capacity(4)
                                        .surface(120)
                                        .available(true)
                                        .amenities(new LinkedHashSet<>(
                                                        List.of("WiFi", "Climatisation", "Piscine privée", "Hammam",
                                                                        "Butler 24h/24", "Terrasse panoramique",
                                                                        "Mini-bar", "Jacuzzi")))
                                        .build();
                        addPhoto(chambre3, "royale-cover.jpg", "https://picsum.photos/seed/royale/1200/800",
                                        "Suite Royale Atlas", true);
                        addPhoto(chambre3, "royale-2.jpg", "https://picsum.photos/seed/royale2/1200/800",
                                        "Piscine privée Atlas", false);
                        addPhoto(chambre3, "royale-3.jpg", "https://picsum.photos/seed/royale3/1200/800",
                                        "Terrasse panoramique", false);

                        Room chambre4 = Room.builder()
                                        .name("Chambre Menthe")
                                        .description("Elegant superior room with authentic tilework.")
                                        .descriptionFr("Chambre supérieure élégante avec zelliges authentiques.")
                                        .descriptionAr("غرفة فائقة أنيقة مع بلاط زليج أصيل")
                                        .type(RoomType.SUPERIOR)
                                        .pricePerNight(BigDecimal.valueOf(1200))
                                        .capacity(2)
                                        .surface(40)
                                        .available(true)
                                        .amenities(new LinkedHashSet<>(
                                                        List.of("WiFi", "Climatisation", "Baignoire", "Vue sur jardin",
                                                                        "Minibar")))
                                        .build();
                        addPhoto(chambre4, "menthe-cover.jpg", "https://picsum.photos/seed/menthe/1200/800",
                                        "Chambre Menthe", true);
                        addPhoto(chambre4, "menthe-2.jpg", "https://picsum.photos/seed/menthe2/1200/800",
                                        "Vue jardin Menthe", false);

                        var savedRooms = roomRepository.saveAll(List.of(chambre1, chambre2, chambre3, chambre4));

                        // ── Réservations exemples pour tester le dashboard
                        User guestUser = guest; // alias

                        // Confirmed reservation (proche)
                        Reservation confirmed = Reservation.builder()
                                        .reservationNumber("RIAD-" + java.util.UUID.randomUUID().toString()
                                                        .replace("-", "").substring(0, 10).toUpperCase())
                                        .user(guestUser)
                                        .room(savedRooms.get(1)) // Suite Andalouse
                                        .checkIn(java.time.LocalDate.now().plusDays(3))
                                        .checkOut(java.time.LocalDate.now().plusDays(6))
                                        .numberOfGuests(2)
                                        .totalPrice(savedRooms.get(1).getPricePerNight()
                                                        .multiply(java.math.BigDecimal.valueOf(3)))
                                        .status(ReservationStatus.CONFIRMED)
                                        .confirmedAt(java.time.LocalDateTime.now())
                                        .specialRequests("Lit bébé demandé")
                                        .build();

                        // Pending reservation (future)
                        Reservation pending = Reservation.builder()
                                        .reservationNumber("RIAD-" + java.util.UUID.randomUUID().toString()
                                                        .replace("-", "").substring(0, 10).toUpperCase())
                                        .user(guestUser)
                                        .room(savedRooms.get(0)) // Chambre Jasmin
                                        .checkIn(java.time.LocalDate.now().plusDays(10))
                                        .checkOut(java.time.LocalDate.now().plusDays(12))
                                        .numberOfGuests(2)
                                        .totalPrice(savedRooms.get(0).getPricePerNight()
                                                        .multiply(java.math.BigDecimal.valueOf(2)))
                                        .status(ReservationStatus.PENDING)
                                        .specialRequests("")
                                        .build();

                        // Completed reservation (past)
                        Reservation completed = Reservation.builder()
                                        .reservationNumber("RIAD-" + java.util.UUID.randomUUID().toString()
                                                        .replace("-", "").substring(0, 10).toUpperCase())
                                        .user(guestUser)
                                        .room(savedRooms.get(2)) // Suite Royale Atlas
                                        .checkIn(java.time.LocalDate.now().minusDays(30))
                                        .checkOut(java.time.LocalDate.now().minusDays(25))
                                        .numberOfGuests(4)
                                        .totalPrice(savedRooms.get(2).getPricePerNight()
                                                        .multiply(java.math.BigDecimal.valueOf(5)))
                                        .status(ReservationStatus.COMPLETED)
                                        .build();

                        // Cancelled reservation (future cancelled)
                        Reservation cancelled = Reservation.builder()
                                        .reservationNumber("RIAD-" + java.util.UUID.randomUUID().toString()
                                                        .replace("-", "").substring(0, 10).toUpperCase())
                                        .user(guestUser)
                                        .room(savedRooms.get(3)) // Chambre Menthe
                                        .checkIn(java.time.LocalDate.now().plusDays(20))
                                        .checkOut(java.time.LocalDate.now().plusDays(22))
                                        .numberOfGuests(2)
                                        .totalPrice(savedRooms.get(3).getPricePerNight()
                                                        .multiply(java.math.BigDecimal.valueOf(2)))
                                        .status(ReservationStatus.CANCELLED)
                                        .cancelledAt(java.time.LocalDateTime.now())
                                        .cancellationReason("Client a annulé pour raison personnelle")
                                        .build();

                        reservationRepository.saveAll(List.of(confirmed, pending, completed, cancelled));

                        log.info("=== Données initialisées: 2 utilisateurs, 4 chambres avec photos ===");
                        log.info("Admin: admin@riad.ma / Admin@1234");
                        log.info("Guest: guest@riad.ma / Guest@1234");
                };
        }

        private void addPhoto(Room room, String fileName, String url, String altText, boolean cover) {
                Photo photo = Photo.builder()
                                .fileName(fileName)
                                .fileUrl(url)
                                .altText(altText)
                                .coverPhoto(cover)
                                .build();
                photo.setRoom(room);
                room.getPhotos().add(photo);
        }
}
