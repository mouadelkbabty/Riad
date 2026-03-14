#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Riad Dar Atlas — Development start script
# Usage: bash start-dev.sh
# ─────────────────────────────────────────────────────────────

set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║     🕌  Riad Lee — Dev Launcher         ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── 1. Check prerequisites ─────────────────────────────────
echo "🔍 Checking prerequisites..."

command -v java  >/dev/null 2>&1 || { echo "❌ Java 21 required. Install: https://adoptium.net"; exit 1; }
command -v mvn   >/dev/null 2>&1 || { echo "❌ Maven required."; exit 1; }
command -v node  >/dev/null 2>&1 || { echo "❌ Node.js 20+ required."; exit 1; }
command -v npm   >/dev/null 2>&1 || { echo "❌ npm required."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required."; exit 1; }

echo "✅ All prerequisites found."
echo ""

# ── 2. Start support services ──────────────────────────────
echo "🐳 Starting PostgreSQL + MailHog..."
docker compose -f "$REPO_ROOT/docker-compose.full.yml" --profile dev up postgres mailhog -d
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5
echo "✅ Support services started."
echo ""

# ── 3. Install frontend deps ───────────────────────────────
if [ ! -d "$REPO_ROOT/frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd "$REPO_ROOT/frontend" && npm install
fi

# ── 4. Start backend ───────────────────────────────────────
echo "🚀 Starting Spring Boot backend (Spring profile: dev)..."
cd "$REPO_ROOT/backend"
mvn spring-boot:run -Dspring-boot.run.profiles=dev &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
echo ""

# ── 5. Wait for backend to be ready ───────────────────────
echo "⏳ Waiting for backend to start (up to 60s)..."
for i in $(seq 1 12); do
  sleep 5
  if curl -sf http://localhost:8080/actuator/health >/dev/null 2>&1; then
    echo "✅ Backend is ready!"
    break
  fi
  echo "   ... still starting ($((i*5))s)"
done

# ── 6. Start frontend ──────────────────────────────────────
echo ""
echo "🅰️  Starting Angular frontend..."
cd "$REPO_ROOT/frontend"
npm start &
FRONTEND_PID=$!

# ── Summary ─────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅  All services are starting up                         ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  🌐  Frontend   : http://localhost:4200                   ║"
echo "║  🔌  API        : http://localhost:8080                   ║"
echo "║  📚  Swagger    : http://localhost:8080/swagger-ui.html   ║"
echo "║  📧  MailHog    : http://localhost:8025                   ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Default admin : admin@riad.ma / Admin@1234               ║"
echo "║  Default guest : guest@riad.ma / Guest@1234               ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Press Ctrl+C to stop all services                        ║"
echo "╚══════════════════════════════════════════════════════════╝"

# ── Cleanup on Ctrl+C ────────────────────────────────────────
trap "echo ''; echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker compose -f \"$REPO_ROOT/docker-compose.full.yml\" --profile dev stop postgres mailhog; exit 0" INT

wait
