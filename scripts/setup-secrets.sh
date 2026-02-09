#!/bin/sh

# Colors
RESET="\033[0m"
BOLD="\033[1m"
P_PURPLE="\033[38;2;211;211;255m"
P_GREEN="\033[38;2;173;235;179m"
P_BLUE="\033[38;2;179;235;242m"

mkdir -p secrets

echo "${BOLD}${P_PURPLE}====================== SECRETS CONFIGURATION ======================${RESET}\n"

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

# Generate JWT if empty
if [ -z "$jwt_access" ]; then
	echo "\n${P_BLUE}Generating JsonWebToken...${RESET}"
	jwt_access=$(openssl rand -hex 32)
	echo "${P_GREEN}Token successfully generated${RESET}\n"
fi

# Writing files
echo "$psql_dbname" > secrets/psql_dbname.txt
echo "$psql_admin_user" > secrets/psql_admin_user.txt
echo "$psql_admin_passwd" > secrets/psql_admin_passwd.txt
echo "$psql_services_passwd" > secrets/psql_services_passwd.txt
echo "$redis_passwd" > secrets/redis_passwd.txt
echo "$jwt_access" > secrets/jwt_access.txt

echo "${BOLD}${P_GREEN}All secret files have been successfully created in the 'secrets' folder${RESET}"