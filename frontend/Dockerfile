# ── Stage 1: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (caching layer)
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy source and build
COPY . .
RUN npm run build:prod

# ── Stage 2: Serve with Nginx ─────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app
COPY --from=builder /app/dist/riad-frontend/browser /usr/share/nginx/html

# Non-root user
RUN addgroup -S riad && adduser -S riad -G riad \
    && chown -R riad:riad /usr/share/nginx/html \
    && chown -R riad:riad /var/cache/nginx \
    && chown -R riad:riad /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown riad:riad /var/run/nginx.pid

USER riad

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
