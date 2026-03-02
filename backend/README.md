# 🕌 Riad — Backend API

API RESTful complète pour le système de réservation d'un Riad.  
Construite avec **Java 21** + **Spring Boot 3.3** selon les meilleures pratiques de sécurité et de production.

---

## 🏗️ Architecture

```
backend/
├── src/main/java/com/riad/
│   ├── config/           → SecurityConfig, ApplicationConfig, JwtProperties…
│   ├── controller/       → AuthController, RoomController, ReservationController, PhotoController
│   ├── domain/
│   │   ├── entity/       → User, Room, Reservation, Photo
│   │   └── enums/        → Role, Permission, ReservationStatus, RoomType
│   ├── dto/
│   │   ├── request/      → RegisterRequest, LoginRequest, ReservationRequest…
│   │   └── response/     → ApiResponse, AuthResponse, RoomResponse…
│   ├── exception/        → GlobalExceptionHandler + exceptions métier
│   ├── repository/       → UserRepository, RoomRepository, ReservationRepository, PhotoRepository
│   ├── security/         → JwtService, JwtAuthFilter, CustomEntryPoint…
│   └── service/          → AuthService, RoomService, ReservationService, EmailService, PhotoService
├── src/main/resources/
│   ├── application.yml   → Configuration principale
│   ├── application-dev.yml → H2 + MailHog
│   ├── application-prod.yml → PostgreSQL + SMTP réel
│   ├── db/migration/     → Scripts Flyway
│   └── templates/email/  → Templates Thymeleaf
├── src/test/             → Tests unitaires + intégration
├── Dockerfile            → Build multi-stage
├── docker-compose.yml    → Stack complète (prod)
└── docker-compose.dev.yml → PostgreSQL + MailHog (dev)
```

---

## 📋 Fonctionnalités

| Domaine | Fonctionnalité |
|---------|----------------|
| **Auth** | Inscription, Connexion JWT, Refresh token, Logout, Reset mot de passe |
| **Chambres** | CRUD complet, filtres (type/prix/capacité), recherche de dispo par dates |
| **Réservations** | Création avec détection de conflits, confirmation, annulation (politique 48h), PDF récapitulatif |
| **Photos** | Upload galerie + chambre, photo de couverture, serving statique |
| **Email** | Bienvenue, confirmation réservation, statut, reset mot de passe (templates HTML) |
| **Sécurité** | JWT stateless, RBAC (GUEST/ADMIN), rate limiting (Nginx), CORS, headers sécurité |

---

## 📡 Endpoints principaux

```
AUTH
  POST /api/v1/auth/register
  POST /api/v1/auth/login
  POST /api/v1/auth/refresh-token
  POST /api/v1/auth/logout
  POST /api/v1/auth/forgot-password
  POST /api/v1/auth/reset-password

CHAMBRES (public en GET)
  GET  /api/v1/rooms
  GET  /api/v1/rooms/{id}
  GET  /api/v1/rooms/available?checkIn=&checkOut=&guests=
  GET  /api/v1/rooms/filter?type=&minPrice=&maxPrice=
  POST /api/v1/rooms                      [ADMIN]
  PUT  /api/v1/rooms/{id}                 [ADMIN]
  PATCH /api/v1/rooms/{id}/toggle-availability [ADMIN]
  DELETE /api/v1/rooms/{id}               [ADMIN]

RÉSERVATIONS (authentifié)
  POST /api/v1/reservations
  GET  /api/v1/reservations/my
  GET  /api/v1/reservations/{id}
  GET  /api/v1/reservations/number/{num}
  GET  /api/v1/reservations/rooms/{roomId}/occupied-dates
  POST /api/v1/reservations/{id}/cancel
  GET  /api/v1/reservations               [ADMIN]
  POST /api/v1/reservations/{id}/confirm  [ADMIN]

PHOTOS (public en GET)
  GET  /api/v1/photos/gallery
  GET  /api/v1/photos/rooms/{roomId}
  POST /api/v1/photos/upload              [ADMIN]
  DELETE /api/v1/photos/{id}              [ADMIN]
  PATCH /api/v1/photos/rooms/{id}/cover/{photoId} [ADMIN]
```

📖 Documentation Swagger: `http://localhost:8080/swagger-ui.html`

---

## 🚀 Démarrage rapide

### Prérequis
- Java 21
- Maven 3.9+
- Docker + Docker Compose

### Développement (H2 en mémoire)

```bash
cd backend

# Lancer PostgreSQL + MailHog pour dev
docker compose -f docker-compose.dev.yml up -d

# Lancer l'API en mode dev
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

L'API sera disponible sur `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`  
H2 Console: `http://localhost:8080/h2-console`  
MailHog UI: `http://localhost:8025`

**Comptes de test (seed auto en DEV):**
- Admin: `admin@riad.ma` / `Admin@1234`
- Guest: `guest@riad.ma` / `Guest@1234`

### Tests

```bash
# Tous les tests + rapport Jacoco
./mvnw test

# Rapport de couverture
open target/site/jacoco/index.html
```

### Production avec Docker

```bash
# 1. Copier et remplir les variables d'environnement
cp .env.example .env
nano .env  # Remplir DB_PASSWORD, JWT_SECRET_KEY, MAIL_*, etc.

# 2. Construire et lancer
docker compose up -d --build

# 3. Vérifier les logs
docker compose logs -f backend
```

---

## 🔐 Sécurité

- **JWT HS512** — Tokens signés (access 24h, refresh 7 jours)
- **BCrypt** coût 12 pour les mots de passe
- **RBAC** — GUEST et ADMIN avec permissions granulaires
- **Validation** — Bean validation sur tous les inputs
- **Rate limiting** — Nginx (5 req/min sur /auth, 30 req/min général)
- **CORS** — Origines autorisées configurables
- **HTTPS** — TLS 1.2/1.3 via Nginx
- **Headers** — X-Frame-Options, HSTS, XSS Protection, CSP
- **Utilisateur non-root** dans le conteneur Docker

---

## 🧪 Tests

| Couche | Technologie |
|--------|-------------|
| Unitaires services | JUnit 5 + Mockito |
| Contrôleurs | Spring MockMvc + @SpringBootTest |
| Intégration (flow) | Spring MockMvc + H2 |
| Couverture cible | ≥ 70% (Jacoco) |

---

## 📦 Stack technique

| Composant | Version |
|-----------|---------|
| Java | 21 (Virtual Threads prêts) |
| Spring Boot | 3.3.5 |
| PostgreSQL | 16 |
| JWT (JJWT) | 0.12.6 |
| SpringDoc OpenAPI | 2.6.0 |
| Flyway | 10.x |
| Thymeleaf | 3.3.x |
| JUnit | 5 |
| Jacoco | 0.8.12 |
| Docker | 24+ |
