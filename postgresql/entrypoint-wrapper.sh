#!/bin/sh
set -e

#
#	Runs as root, BEFORE the official postgres entrypoint drops privileges to
#	`postgres`. Reads service-user passwords from root-only secret files and
#	exports them so init scripts (executed as `postgres`) can use them via env
#	without needing read access to /run/secrets/.
#
for name in PSQL_AUTH_PASSWD PSQL_PLAYER_PASSWD PSQL_CHAT_PASSWD; do
	file="/run/secrets/$(echo "$name" | tr '[:upper:]' '[:lower:]')"
	[ -r "$file" ] && export "$name=$(tr -d '\r\n' < "$file")"
done

exec docker-entrypoint.sh "$@"
