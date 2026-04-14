#!/bin/bash

# ─── ANSI codes ──────────────────
RESET="\033[0m"
BOLD="\033[1m"

P_YELLOW="\033[38;2;255;234;150m"
P_PURPLE="\033[38;2;211;211;255m"
P_BLUE="\033[38;2;179;235;242m"
P_GREEN="\033[38;2;173;235;179m"

# ─── Resolve project root ──────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# ─── Check ───────────────────────
if [ -f secrets/psql_dbname.txt ]; then
	printf "${BOLD}${P_YELLOW}Secrets already exist, skipping...${RESET}\n\n"
	exit 0
fi

mkdir -p secrets

printf "${BOLD}${P_PURPLE}------------- SECRETS CONFIGURATION --------------${RESET}\n\n"

# ─── User input ──────────────────
read -p "PSQL_DBNAME: " psql_dbname
read -p "PSQL_ADMIN_USER: " psql_admin_user
read -s -p "PSQL_ADMIN_PASSWD: " psql_admin_passwd
echo ""
read -s -p "PSQL_AUTH_PASSWD: " psql_auth_passwd
echo ""
read -s -p "PSQL_PLAYER_PASSWD: " psql_player_passwd
echo ""
read -s -p "PSQL_CHAT_PASSWD: " psql_chat_passwd
echo ""
read -s -p "REDIS_PASSWD: " redis_passwd
echo ""
read -s -p "JWT_SIGNING_KEY (press ENTER to generate automatically): " jwt_signing_key
echo ""

# ─── JWT generation ──────────────
if [ -z "$jwt_signing_key" ]; then
	printf "\n${P_BLUE}Generating JsonWebToken signing key...${RESET}\n"
	jwt_signing_key=$(openssl rand -hex 32)
	printf "${P_GREEN}Signing key successfully generated!${RESET}\n"
	echo ""
fi

# ─── Writing files ───────────────
echo "$psql_dbname" > secrets/psql_dbname.txt
echo "$psql_admin_user" > secrets/psql_admin_user.txt
echo "$psql_admin_passwd" > secrets/psql_admin_passwd.txt
echo "$psql_auth_passwd" > secrets/psql_auth_passwd.txt
echo "$psql_player_passwd" > secrets/psql_player_passwd.txt
echo "$psql_chat_passwd" > secrets/psql_chat_passwd.txt
echo "$redis_passwd" > secrets/redis_passwd.txt
echo "$jwt_signing_key" > secrets/jwt_signing_key.txt

chmod 600 secrets/*.txt

printf "${BOLD}${P_GREEN}Secret files have been created!${RESET}\n\n"
