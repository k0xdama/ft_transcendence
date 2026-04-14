#!/bin/bash

set -euo pipefail

# ─── ANSI codes ────────────────────────────────
RESET="\033[0m"
BOLD="\033[1m"

P_YELLOW="\033[38;2;255;234;150m"
P_PURPLE="\033[38;2;211;211;255m"
P_BLUE="\033[38;2;179;235;242m"
P_GREEN="\033[38;2;173;235;179m"

# ─── Resolve project root ──────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# ─── Check ─────────────────────────────────────
if [ -f secrets/psql_dbname.txt ]; then
	printf "${BOLD}${P_YELLOW}Secrets already exist, skipping...${RESET}\n\n"
	exit 0
fi

mkdir -p secrets

printf "${BOLD}${P_PURPLE}---------------- SECRETS CREATION ----------------${RESET}\n\n"

# ─── Load .env.secrets if present ──────────────
if [ -f .env.secrets ]; then
	printf "${P_BLUE}Loading values from .env.secrets...${RESET}\n"
	set -a
	# shellcheck disable=SC1091
	. ./.env.secrets
	set +a
fi

# ─── Required variables ────────────────────────
# Non-sensitive defaults are kept as-is; missing secrets are auto-generated (fallback)
PSQL_DBNAME="${PSQL_DBNAME:-triple_db}"
PSQL_ADMIN_USER="${PSQL_ADMIN_USER:-admin}"

generated=()
for var in PSQL_ADMIN_PASSWD PSQL_AUTH_PASSWD PSQL_PLAYER_PASSWD PSQL_CHAT_PASSWD REDIS_PASSWD; do
	if [ -z "${!var:-}" ]; then
		printf -v "$var" '%s' "$(openssl rand -base64 24 | tr -d '\n/+=' | cut -c1-24)"
		generated+=("$var")
	fi
done

# ─── JWT generation ────────────────────────────
if [ -z "${JWT_SIGNING_KEY:-}" ]; then
	printf "${P_BLUE}Generating JsonWebToken signing key...${RESET}\n"
	JWT_SIGNING_KEY="$(openssl rand -hex 32)"
	generated+=("JWT_SIGNING_KEY")
fi

if [ "${#generated[@]}" -gt 0 ]; then
	printf "${P_GREEN}Auto-generated values for:${RESET}\n"
	for var in "${generated[@]}"; do
		printf "  - %s\n" "$var"
	done
	printf "\n"
fi

# ─── Writing files ─────────────────────────────
printf '%s\n' "$PSQL_DBNAME"        > secrets/psql_dbname.txt
printf '%s\n' "$PSQL_ADMIN_USER"    > secrets/psql_admin_user.txt
printf '%s\n' "$PSQL_ADMIN_PASSWD"  > secrets/psql_admin_passwd.txt
printf '%s\n' "$PSQL_AUTH_PASSWD"   > secrets/psql_auth_passwd.txt
printf '%s\n' "$PSQL_PLAYER_PASSWD" > secrets/psql_player_passwd.txt
printf '%s\n' "$PSQL_CHAT_PASSWD"   > secrets/psql_chat_passwd.txt
printf '%s\n' "$REDIS_PASSWD"       > secrets/redis_passwd.txt
printf '%s\n' "$JWT_SIGNING_KEY"    > secrets/jwt_signing_key.txt

chmod 600 secrets/*.txt

printf "${BOLD}${P_GREEN}Secret files have been created!${RESET}\n\n"
