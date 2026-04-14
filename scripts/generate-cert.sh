#!/bin/bash

#
# Strict mode:
#	exit on error (-e),
#	treat unset variables as errors (-u),
#	fail pipelines if any command fails (-o pipefail)
#
set -euo pipefail

# ─── ANSI codes ────────────────────────────────
RESET="\033[0m"
BOLD="\033[1m"

P_YELLOW="\033[38;2;255;234;150m"
P_PURPLE="\033[38;2;211;211;255m"
P_GREEN="\033[38;2;173;235;179m"
P_RED="\033[38;2;255;170;170m"

# ─── Resolve project root ──────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# ─── Check ─────────────────────────────────────
if [ -f secrets/ssl/key.pem ]; then
	printf "${BOLD}${P_YELLOW}Certificate already exists, skipping...${RESET}\n\n"
	exit 0
fi

printf "${BOLD}${P_PURPLE}------------- CERTIFICATE GENERATION -------------${RESET}\n\n"

# ─── Required tooling & info ───────────────────
missing=()
command -v openssl >/dev/null 2>&1 || missing+=("openssl (install it with your package manager)")
command -v hostname >/dev/null 2>&1 || missing+=("hostname (needed to detect the local IP)")

# IP=$(ipconfig getifaddr en0 2>/dev/null)
IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
if [ -z "$IP" ]; then
	missing+=("local IP address (hostname -I returned nothing — set the IP env var manually)")
fi

if [ "${#missing[@]}" -gt 0 ]; then
	printf "${BOLD}${P_RED}Missing required tooling or info:${RESET}\n"
	for item in "${missing[@]}"; do
		printf "  - %s\n" "$item"
	done
	printf "\n"
	exit 1
fi

# ─── Certificate generation ────────────────────
KEY_FILE="secrets/ssl/key.pem"
CERT_FILE="secrets/ssl/cert.pem"
SAN="IP:${IP},DNS:localhost"

mkdir -p secrets/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	-keyout "$KEY_FILE" \
	-out "$CERT_FILE" \
	-subj "/CN=localhost" \
	-addext "subjectAltName=$SAN"

chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"

printf "${BOLD}${P_GREEN}SSL key and certificate have been generated for IP: ${RESET}$IP\n\n"
