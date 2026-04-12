#!/bin/bash

# ── ANSI ────────────────────────
RESET="\033[0m"
BOLD="\033[1m"

P_YELLOW="\033[38;2;255;234;150m"
P_PURPLE="\033[38;2;211;211;255m"
P_BLUE="\033[38;2;179;235;242m"
P_GREEN="\033[38;2;173;235;179m"

# ── Check ───────────────────────
if [ -f secrets/psql_dbname.txt ]; then
	printf "${BOLD}${P_YELLOW}Secrets already exist, skipping...${RESET}\n\n"
	exit 0
fi

mkdir -p secrets

printf "${BOLD}${P_PURPLE}------------- SECRETS CONFIGURATION --------------${RESET}\n\n"

# ── User input ──────────────────
read -p "PSQL_DBNAME: " psql_dbname
read -p "PSQL_ADMIN_USER: " psql_admin_user
read -s -p "PSQL_ADMIN_PASSWD: " psql_admin_passwd
echo ""
read -s -p "PSQL_SERVICES_PASSWD: " psql_services_passwd
echo ""
read -s -p "REDIS_PASSWD: " redis_passwd
echo ""
read -s -p "JWT_ACCESS (leave blank to generate automatically - press ENTER): " jwt_access
echo ""

# ── JWT generation ──────────────
if [ -z "$jwt_access" ]; then
	printf "\n${P_BLUE}Generating JsonWebToken...${RESET}\n"
	jwt_access=$(openssl rand -hex 32)
	printf "${P_GREEN}Token successfully generated${RESET}\n"
	echo ""
fi

# ── Writing files ───────────────
echo "$psql_dbname" > secrets/psql_dbname.txt
echo "$psql_admin_user" > secrets/psql_admin_user.txt
echo "$psql_admin_passwd" > secrets/psql_admin_passwd.txt
echo "$psql_services_passwd" > secrets/psql_services_passwd.txt
echo "$redis_passwd" > secrets/redis_passwd.txt
echo "$jwt_access" > secrets/jwt_access.txt

printf "${BOLD}${P_GREEN}Secret files have been created into ./secrets/${RESET}\n\n"
