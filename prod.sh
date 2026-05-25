#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# prod.sh  —  Command center for PRODUCTION container stack
#
# Usage:
#   ./prod.sh [command] [options]
#
# Commands:
#   start             Deploy/start prod stack (background by default). Flags: --build
#   stop / down       Stop running production containers
#   clean             Stop stack and delete production Postgres volumes (WARNING: wipes prod database!)
#   restart           Gracefully restart production stack
#   logs [service]    View production logs (e.g. ./prod.sh logs, ./prod.sh logs backend)
#   ps                Check production container status and health
#   shell [service]   Open shell inside production container (e.g. ./prod.sh shell backend)
#   check             Validate production docker-compose configuration
#   build             Rebuild production container images
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ENV_FILE=".env.prod"
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml"

# ── Prerequisites check ────────────────────────────────────────────────────────
validate_prerequisites() {
  if ! command -v docker &>/dev/null; then
    echo "❌  Docker not found."
    exit 1
  fi

  if [ ! -f "$ENV_FILE" ]; then
    echo "❌  $ENV_FILE not found!"
    echo "    Copy .env.prod.example to .env.prod and fill in real values."
    exit 1
  fi

  # Sanity check: refuse to start if placeholder values remain
  if grep -q "CHANGE_ME" "$ENV_FILE"; then
    echo "❌  $ENV_FILE still contains placeholder values (CHANGE_ME)."
    echo "    Replace all CHANGE_ME values before deploying to production."
    exit 1
  fi
}

show_help() {
  echo "🚀 Timetable System - Production Operations Command Center"
  echo "=========================================================="
  echo "Usage: ./prod.sh [command] [options]"
  echo ""
  echo "Commands:"
  echo "  (none) / start    Deploy stack in background (production standard)"
  echo "                    Options:"
  echo "                      --build   Force rebuild of production Docker images"
  echo "  stop / down       Stop running production services cleanly"
  echo "  clean             Stop stack and delete production database volume (⚠️ WIPES DB!)"
  echo "  restart           Perform a graceful restart of production stack"
  echo "  logs [service]    Tail production logs (e.g. ./prod.sh logs)"
  echo "  ps                List production container health states"
  echo "  shell [service]   Enter container shell (defaults to 'backend')"
  echo "  check             Validate compose configs and print resolved environment"
  echo "  build             Rebuild production container images"
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
  shift ${1+/dev/null} || true
fi

case "$COMMAND" in
  start)
    validate_prerequisites
    BUILD_FLAG=""
    
    for arg in "$@"; do
      case $arg in
        --build) BUILD_FLAG="--build" ;;
        *) echo "❌ Unknown option: $arg"; show_help; exit 1 ;;
      esac
    done

    echo "🚀 Deploying PRODUCTION stack..."
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES up -d $BUILD_FLAG

    echo ""
    echo "✅ Production stack successfully started."
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "    1. Health:  ./prod.sh ps"
    echo "    2. Logs:    ./prod.sh logs"
    echo "    3. Backend: curl -f http://localhost/api/actuator/health"
    echo "    4. Monitor for 15 minutes before considering deployment stable."
    echo ""
    echo "⚠️  Rollback:  ./prod.sh down && tag previous image back to latest"
    ;;

  stop|down)
    validate_prerequisites
    echo "🛑 Stopping production stack..."
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES down
    echo "✅ Production stack stopped."
    ;;

  clean)
    validate_prerequisites
    echo "⚠️  WARNING: You are about to wipe the PRODUCTION database!"
    read -p "Are you absolutely sure you want to proceed? [y/N] " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "🛑 Wiping production stack and deleting Postgres volumes..."
      docker compose --env-file "$ENV_FILE" $COMPOSE_FILES down -v
      echo "✅ Production database volume successfully deleted."
    else
      echo "❌ Operation cancelled by user."
    fi
    ;;

  restart)
    validate_prerequisites
    echo "🔄 Gracefully restarting production stack..."
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES restart
    echo "✅ Production stack restarted."
    ;;

  logs)
    validate_prerequisites
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
    echo "💻 Entering interactive shell inside production '$SERVICE' container..."
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES exec "$SERVICE" sh || \
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES exec "$SERVICE" bash
    ;;

  check)
    validate_prerequisites
    echo "🔍 Validating Compose configuration..."
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES config
    echo "✅ Configuration is valid."
    ;;

  build)
    validate_prerequisites
    echo "🛠️ Rebuilding production images..."
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
