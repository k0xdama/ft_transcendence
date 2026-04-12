#!/bin/bash

# ── ANSI ───────────────────
RESET="\033[0m"
BOLD="\033[1m"

P_YELLOW="\033[38;2;255;234;150m"
P_PURPLE="\033[38;2;211;211;255m"
P_BLUE="\033[38;2;179;235;242m"
P_GREEN="\033[38;2;173;235;179m"

# ── Check ──────────────────
if [ -f .env ]; then
	printf "${BOLD}${P_YELLOW}.env already exists, skipping...${RESET}\n\n"
	exit 0
fi

printf "${BOLD}${P_PURPLE}----------------- .ENV CREATION ------------------${RESET}\n\n"

printf "\n${P_BLUE}Adding env var values...${RESET}\n"

# ── Var insertion ──────────
cat > .env <<'EOF'
# Service URLs (used by api-gateway and inter-service calls)
AUTH_URL=https://auth:3000
PLAYER_URL=https://player:3001
CHAT_URL=https://chat:2000
LOBBY_URL=https://lobby:3003
GAME_URL=https://game:3002

# API Gateway
PORT=4000
CORS_ORIGIN=https://localhost:5173

# Redis (used by stats-worker)
REDIS_URL=redis://redis:6379
EOF

printf "${BOLD}${P_GREEN}.env file and its variables have been created!${RESET}\n\n"
