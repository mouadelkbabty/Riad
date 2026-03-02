-- V1__initial_schema.sql
-- Schéma initial pour le système de réservation Riad

-- ============ USERS ============
CREATE TABLE IF NOT EXISTS users (
    id                        BIGSERIAL PRIMARY KEY,
    first_name                VARCHAR(100)        NOT NULL,
    last_name                 VARCHAR(100)        NOT NULL,
    email                     VARCHAR(255) UNIQUE NOT NULL,
    password                  TEXT                NOT NULL,
    phone                     VARCHAR(20),
    role                      VARCHAR(20)         NOT NULL DEFAULT 'GUEST',
    enabled                   BOOLEAN             NOT NULL DEFAULT TRUE,
    email_verified            BOOLEAN             NOT NULL DEFAULT FALSE,
    refresh_token             TEXT,
    password_reset_token      TEXT UNIQUE,
    password_reset_token_expiry TIMESTAMP,
    created_at                TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_refresh_token ON users(refresh_token);

-- ============ ROOMS ============
CREATE TABLE IF NOT EXISTS rooms (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    description      TEXT         NOT NULL,
    description_fr   TEXT         NOT NULL,
    description_ar   TEXT         NOT NULL,
    type             VARCHAR(30)  NOT NULL,
    price_per_night  DECIMAL(10,2) NOT NULL,
    capacity         INT          NOT NULL,
    surface          INT          NOT NULL,
    available        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============ ROOM AMENITIES ============
CREATE TABLE IF NOT EXISTS room_amenities (
    room_id BIGINT      NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    amenity VARCHAR(100) NOT NULL
);

-- ============ RESERVATIONS ============
CREATE TABLE IF NOT EXISTS reservations (
    id                   BIGSERIAL PRIMARY KEY,
    reservation_number   VARCHAR(20) UNIQUE NOT NULL,
    user_id              BIGINT             NOT NULL REFERENCES users(id),
    room_id              BIGINT             NOT NULL REFERENCES rooms(id),
    check_in             DATE               NOT NULL,
    check_out            DATE               NOT NULL,
    number_of_guests     INT                NOT NULL,
    total_price          DECIMAL(10,2)      NOT NULL,
    status               VARCHAR(20)        NOT NULL DEFAULT 'PENDING',
    special_requests     TEXT,
    created_at           TIMESTAMP          NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP          NOT NULL DEFAULT NOW(),
    confirmed_at         TIMESTAMP,
    cancelled_at         TIMESTAMP,
    cancellation_reason  TEXT,
    CONSTRAINT chk_dates CHECK (check_out > check_in)
);

CREATE INDEX IF NOT EXISTS idx_reservation_user    ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservation_room    ON reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_reservation_dates   ON reservations(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_reservation_status  ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservation_number  ON reservations(reservation_number);

-- ============ PHOTOS ============
CREATE TABLE IF NOT EXISTS photos (
    id            BIGSERIAL PRIMARY KEY,
    file_name     TEXT         NOT NULL,
    file_url      TEXT         NOT NULL,
    alt_text      VARCHAR(100) NOT NULL,
    caption       VARCHAR(255),
    display_order INT          NOT NULL DEFAULT 0,
    cover_photo   BOOLEAN      NOT NULL DEFAULT FALSE,
    room_id       BIGINT       REFERENCES rooms(id) ON DELETE CASCADE,
    uploaded_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photo_room ON photos(room_id);
