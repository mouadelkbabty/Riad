package com.riad.config;

import com.riad.domain.entity.Room;
import com.riad.domain.entity.User;
import com.riad.domain.enums.Role;
import com.riad.domain.enums.RoomType;
import com.riad.repository.RoomRepository;
import com.riad.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    @Bean
    public CommandLineRunner seedData(UserRepository userRepository,
                                       RoomRepository roomRepository,
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
                    .amenities(List.of("WiFi", "Climatisation", "Salle de bain privée", "Vue sur patio"))
                    .build();

            Room chambre2 = Room.builder()
                    .name("Suite Andalouse")
                    .description("A luxurious suite with stunning views of the medina.")
                    .descriptionFr("Une suite luxueuse avec une vue imprenable sur la médina.")
                    .descriptionAr("جناح فاخر مع إطلالة رائعة على المدينة العتيقة")
                    .type(RoomType.SUITE)
                    .pricePerNight(BigDecimal.valueOf(1800))
                    .capacity(4)
                    .surface(60)
                    .amenities(List.of("WiFi", "Climatisation", "Hammam privé", "Salon", "Terrasse",
                            "Service de chambre", "Baignoire"))
                    .build();

            Room chambre3 = Room.builder()
                    .name("Suite Royale Atlas")
                    .description("The crown jewel of the Riad - a royal suite with a private pool.")
                    .descriptionFr("Le joyau de la couronne du Riad - une suite royale avec piscine privée.")
                    .descriptionAr("درة تاج الرياض - جناح ملكي مع مسبح خاص")
                    .type(RoomType.SUITE_ROYALE)
                    .pricePerNight(BigDecimal.valueOf(3500))
                    .capacity(4)
                    .surface(120)
                    .amenities(List.of("WiFi", "Climatisation", "Piscine privée", "Hammam",
                            "Butler 24h/24", "Terrasse panoramique", "Mini-bar", "Jacuzzi"))
                    .build();

            Room chambre4 = Room.builder()
                    .name("Chambre Menthe")
                    .description("Elegant superior room with authentic tilework.")
                    .descriptionFr("Chambre supérieure élégante avec zelliges authentiques.")
                    .descriptionAr("غرفة فائقة أنيقة مع بلاط زليج أصيل")
                    .type(RoomType.SUPERIOR)
                    .pricePerNight(BigDecimal.valueOf(1200))
                    .capacity(2)
                    .surface(40)
                    .amenities(List.of("WiFi", "Climatisation", "Baignoire", "Vue sur jardin", "Minibar"))
                    .build();

            roomRepository.saveAll(List.of(chambre1, chambre2, chambre3, chambre4));

            log.info("=== Données initialisées: 2 utilisateurs, 4 chambres ===");
            log.info("Admin: admin@riad.ma / Admin@1234");
            log.info("Guest: guest@riad.ma / Guest@1234");
        };
    }
}
