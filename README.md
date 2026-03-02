# Riad Dar Atlas — Système de Réservation

Application web complète pour un riad marocain : galerie de photos, réservation en ligne avec confirmations par e-mail, espace client et tableau de bord administrateur.

---

## Stack Technique

| Couche       | Technologies                                             |
|--------------|----------------------------------------------------------|
| **Backend**  | Java 21, Spring Boot 3.3.5, Spring Security + JWT        |
| **Database** | PostgreSQL 16 (prod) · H2 (dev) · Flyway migrations      |
| **Frontend** | Angular 17.3 (standalone), Tailwind CSS 3.4, TypeScript  |
| **E-mail**   | Spring Mail + Thymeleaf · MailHog (dev)                  |
| **Infra**    | Docker, docker-compose, Nginx, JaCoCo ≥ 70 %             |

---

## Démarrage Rapide (Développement)

### Prérequis
- Java 21 (`java -version`)
- Node.js 20+ (`node -v`)
- Maven 3.9+ (`mvn -v`)
- Docker Desktop

### 1 — Cloner & configurer

```bash
git clone https://github.com/<vous>/riad-reservation.git
cd riad-reservation

# Copier les variables d'environnement
cp backend/.env.example backend/.env
# Éditez backend/.env : JWT_SECRET_KEY minimum 64 caractères
```

### 2 — Démarrer les services de support (PostgreSQL + MailHog)

```bash
docker compose -f docker-compose.full.yml --profile dev up postgres mailhog -d
```

### 3 — Lancer le backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
→ API disponible sur http://localhost:8080  
→ Swagger UI : http://localhost:8080/swagger-ui.html

### 4 — Lancer le frontend

```bash
cd frontend
npm install
npm start
```
→ Application sur http://localhost:4200  
→ Utilise le proxy Angular (proxy.conf.json) → backend sur /api

### 5 — Vérifier les e-mails

MailHog Web UI : http://localhost:8025

---

## Comptes par Défaut (profil dev)

| Rôle          | E-mail              | Mot de passe   |
|---------------|---------------------|----------------|
| Administrateur | admin@riad.ma      | Admin@1234     |
| Client        | guest@riad.ma       | Guest@1234     |

---

## Structure du Projet

```
riad/
├── backend/                      ← Spring Boot API
│   ├── src/main/java/com/riad/
│   │   ├── config/               ← Security, JWT, CORS, Seeds
│   │   ├── domain/               ← Entités JPA + Enums
│   │   ├── dto/                  ← Request / Response DTOs
│   │   ├── repository/           ← Spring Data JPA
│   │   ├── security/             ← JWT Filter, service
│   │   ├── service/              ← Logique métier
│   │   ├── controller/           ← REST controllers
│   │   └── exception/            ← Exceptions métier
│   ├── src/main/resources/
│   │   ├── application*.yml      ← Config dev / prod
│   │   ├── db/migration/         ← Flyway SQL
│   │   └── templates/email/      ← E-mails Thymeleaf HTML
│   └── src/test/                 ← JUnit 5 + Mockito + Testcontainers
├── frontend/                     ← Angular 17 SPA
│   └── src/app/
│       ├── core/                 ← Models, Services, Guards, Interceptors
│       ├── shared/               ← Navbar, Footer, Toast, Spinner
│       └── features/
│           ├── home/             ← Landing page
│           ├── auth/             ← Login, Register, Forgot/Reset password
│           ├── rooms/            ← Liste & détail des chambres
│           ├── reservations/     ← Créer / mes réservations / détail
│           ├── admin/            ← Dashboard, chambres, réservations, galerie
│           └── profile/          ← Profil utilisateur
├── .devcontainer/
│   └── devcontainer.json         ← GitHub Codespace config
├── docker-compose.full.yml       ← Stack complète
└── .env.example                  ← Variables d'environnement
```

---

## Endpoints API Principaux

| Méthode | URL                              | Auth       | Description                     |
|---------|----------------------------------|------------|---------------------------------|
| POST    | /api/v1/auth/register            | Public     | Inscription                     |
| POST    | /api/v1/auth/login               | Public     | Connexion → JWT                 |
| GET     | /api/v1/rooms                    | Public     | Liste des chambres (paginée)    |
| GET     | /api/v1/rooms/available          | Public     | Chambres disponibles            |
| POST    | /api/v1/reservations             | GUEST+     | Créer une réservation           |
| GET     | /api/v1/reservations/my          | GUEST+     | Mes réservations                |
| POST    | /api/v1/reservations/{id}/cancel | GUEST+     | Annuler                         |
| POST    | /api/v1/reservations/{id}/confirm| ADMIN      | Confirmer                       |
| GET     | /api/v1/photos/gallery           | Public     | Galerie du riad                 |
| POST    | /api/v1/photos                   | ADMIN      | Uploader une photo              |

Swagger complet : http://localhost:8080/swagger-ui.html

---

## Tests

```bash
cd backend
mvn test                  # Tests unitaires + intégration
mvn verify                # Avec rapport JaCoCo (cible ≥ 70%)
# Rapport : target/site/jacoco/index.html
```

---

## Production (Docker)

```bash
# Copier et remplir les variables
cp backend/.env.example backend/.env
# Générer un secret JWT : openssl rand -base64 48

# Build et démarrage
docker compose -f docker-compose.full.yml up --build -d

# Consulter les logs
docker compose -f docker-compose.full.yml logs -f backend
```

---

## GitHub Codespace

Ce projet inclut une configuration `.devcontainer/` prête pour GitHub Codespaces :
1. Forker / pousser ce repo sur GitHub
2. Cliquer **Code → Open with Codespaces → New codespace**
3. Attendre l'installation automatique (≈ 3 minutes)
4. Lancer : `bash start-dev.sh`

Les ports 4200, 8080, 8025 seront automatiquement redirigés.

---

## Règles Métier

- **Annulation** : impossible < 48h avant l'arrivée (sauf admin)
- **Réservation** : maximum 365 jours à l'avance
- **Prix** : `pricePerNight × numberOfNights`
- **Conflits** : détection automatique par plage de dates
- **Complétion** : job `@Scheduled` à 2h du matin (réservations passées → COMPLETED)

---

*Riad Dar Atlas © 2024 — Fait avec ❤️ au Maroc*
