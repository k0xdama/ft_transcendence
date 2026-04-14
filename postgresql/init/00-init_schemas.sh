#!/bin/sh
set -e

# Service-user passwords are exported by the wrapper entrypoint
# (postgresql/entrypoint-wrapper.sh), which reads /run/secrets/* as root
# before privileges are dropped to `postgres`.
psql -v ON_ERROR_STOP=1 \
	-v auth_pwd="$PSQL_AUTH_PASSWD" \
	-v player_pwd="$PSQL_PLAYER_PASSWD" \
	-v chat_pwd="$PSQL_CHAT_PASSWD" \
	--username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-'EOSQL'
	-- Create schemas
	CREATE SCHEMA IF NOT EXISTS auth;
	CREATE SCHEMA IF NOT EXISTS player;
	CREATE SCHEMA IF NOT EXISTS chat;

	-- Create service users (psql :'var' quotes as a safe SQL literal)
	CREATE USER auth_user   WITH PASSWORD :'auth_pwd';
	CREATE USER player_user WITH PASSWORD :'player_pwd';
	CREATE USER chat_user   WITH PASSWORD :'chat_pwd';

	-- Permissions : each user has access only to their own schema
	GRANT USAGE, CREATE ON SCHEMA auth   TO auth_user;
	GRANT USAGE, CREATE ON SCHEMA player TO player_user;
	GRANT USAGE, CREATE ON SCHEMA chat   TO chat_user;

	-- Permissions on future tables
	ALTER DEFAULT PRIVILEGES IN SCHEMA auth   GRANT ALL ON TABLES TO auth_user;
	ALTER DEFAULT PRIVILEGES IN SCHEMA player GRANT ALL ON TABLES TO player_user;
	ALTER DEFAULT PRIVILEGES IN SCHEMA chat   GRANT ALL ON TABLES TO chat_user;
EOSQL
