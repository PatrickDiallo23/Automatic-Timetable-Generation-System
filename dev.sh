#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# dev.sh  —  Command center for DEVELOPMENT container stack
#
# What this does:
#   Provides a single, intuitive interface for managing your local dev stack.
#
# Usage:
#   ./dev.sh [command] [options]
#
# Commands:
#   start             Start dev stack (default). Flags: --build, --detach
#   stop / down       Stop running containers
#   clean             Stop stack and delete PostgreSQL volume (wipe database)
#   restart           Restart all services
#   logs [service]    View and tail container logs (optionally for a specific service)
#   ps                Show running container status and ports
#   shell [service]   Open an interactive shell inside a container (defaults to backend)
#   build             Rebuild container images
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ENV_FILE=".env.dev"
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.dev.yml"

# ── Prerequisites check ────────────────────────────────────────────────────────
validate_prerequisites() {
  if ! command -v docker &>/dev/null; then
    echo "❌  Docker not found. Install Docker Desktop: https://www.docker.com/get-started"
    exit 1
  fi

  if ! docker compose version &>/dev/null; then
    echo "❌  Docker Compose v2 not found. Ensure Docker Desktop is up to date."
    exit 1
  fi

  if [ ! -f "$ENV_FILE" ]; then
    echo "❌  $ENV_FILE not found. Expected at project root."
    exit 1
  fi
}

show_help() {
  echo "🐳 Timetable System - Developer Command Center (Dev Mode)"
  echo "=========================================================="
  echo "Usage: ./dev.sh [command] [options]"
  echo ""
  echo "Commands:"
  echo "  (none) / start    Start stack (foreground with log tail by default)"
  echo "                    Options:"
  echo "                      --build   Force rebuild of Docker images"
  echo "                      --detach  Run in background (no logs tail)"
  echo "  stop / down       Stop running containers cleanly"
  echo "  clean             Stop stack and delete Postgres data volume (WIPES database)"
  echo "  restart           Restart stack containers"
  echo "  logs [service]    Tail logs (e.g. ./dev.sh logs, ./dev.sh logs backend)"
  echo "  ps                List running containers and their exposed ports"
  echo "  shell [service]   Open terminal inside container (defaults to 'backend')"
  echo "  build             Rebuild container images"
  echo "  help / -h / --help Show this help message"
  echo ""
}

# Determine the subcommand
COMMAND="${1:-start}"

# If first argument looks like a flag, default command is start
if [[ "$COMMAND" =~ ^- ]]; then
  COMMAND="start"
else
  # Shift first argument so remaining args can be passed to functions/commands
  [ $# -gt 0 ] && shift || true
fi

case "$COMMAND" in
  start)
    validate_prerequisites
    BUILD_FLAG=""
    DETACH_FLAG=""
    
    # Parse options for start command
    for arg in "$@"; do
      case $arg in
        --build)  BUILD_FLAG="--build" ;;
        --detach) DETACH_FLAG="-d" ;;
        *) echo "❌ Unknown option: $arg"; show_help; exit 1 ;;
      esac
    done

    echo "🚀 Starting DEV stack (env: $ENV_FILE) ..."
    echo "    Access points after startup:"
    echo "    → App:      http://localhost:$(grep NGINX_PORT $ENV_FILE | cut -d= -f2 | tr -d ' ')"
    echo "    → Backend:  http://localhost:8200/actuator/health"
    echo "    → Swagger:  http://localhost:$(grep NGINX_PORT $ENV_FILE | cut -d= -f2 | tr -d ' ')/swagger-ui.html"
    echo "    → Postgres: localhost:$(grep PG_EXPOSED_PORT $ENV_FILE | cut -d= -f2 | tr -d ' ') (user from .env.dev)"
    echo "    → Debug:    localhost:$(grep BACKEND_DEBUG_PORT $ENV_FILE | cut -d= -f2 | tr -d ' ') (remote JVM debugger)"
    echo ""

    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES up $BUILD_FLAG $DETACH_FLAG

    if [ -n "$DETACH_FLAG" ]; then
      echo "✅ Services started in background."
      echo "📋 Tail logs with:  ./dev.sh logs"
    fi
    ;;

  stop|down)
    validate_prerequisites
    echo "🛑 Stopping dev stack..."
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES down
    echo "✅ Dev stack stopped."
    ;;

  clean)
    validate_prerequisites
    echo "⚠️  WIPING database and removing containers..."
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES down -v
    echo "✅ Database volume deleted. Fresh state restored."
    ;;

  restart)
    validate_prerequisites
    echo "🔄 Restarting dev stack..."
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES restart
    echo "✅ Stack restarted."
    ;;

  logs)
    validate_prerequisites
    # If a specific service was requested (e.g., ./dev.sh logs frontend)
    SERVICE="${1:-}"
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES logs -f $SERVICE
    ;;

  ps)
    validate_prerequisites
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES ps
    ;;

  shell)
    validate_prerequisites
    SERVICE="${1:-backend}"
    echo "💻 Entering interactive shell inside '$SERVICE' container..."
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES exec "$SERVICE" sh || \
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES exec "$SERVICE" bash
    ;;

  build)
    validate_prerequisites
    echo "🛠️ Rebuilding dev images..."
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES build "$@"
    echo "✅ Build completed."
    ;;

  help|-h|--help)
    show_help
    ;;

  *)
    echo "❌ Unknown command: $COMMAND"
    show_help
    exit 1
    ;;
esac
