#!/bin/bash

# ── ANSI ────────────────────────
RESET="\033[0m"
BOLD="\033[1m"
P_YELLOW="\033[38;2;255;234;150m"
P_PURPLE="\033[38;2;211;211;255m"
P_GREEN="\033[38;2;173;235;179m"

# ── Check ───────────────────────
if [ -f secrets/ssl/key.pem ]; then
	printf "${BOLD}${P_YELLOW}Certificate already exists, skipping...${RESET}\n"
	exit 0
fi

printf "${BOLD}${P_PURPLE}------------- CERTIFICATE GENERATION -------------${RESET}\n\n"

# ── Certificate generation ──────
# IP=$(hostname -I | awk '{print $1}')
IP=$(ipconfig getifaddr en0 2>/dev/null)
mkdir -p secrets/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	-keyout secrets/ssl/key.pem \
	-out secrets/ssl/cert.pem \
	-subj "/CN=$IP" \
	-addext "subjectAltName=DNS:localhost,IP:$IP,IP:127.0.0.1"

printf "${BOLD}${P_GREEN}Certificate generated for IP: ${RESET}$IP\n\n"
