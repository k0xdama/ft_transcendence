#!/bin/sh
set -e

# AUTH_PASSWD=$(cat /run/secrets/psql_auth_passwd)
# PLAYER_PASSWD=$(cat /run/secrets/psql_player_passwd)
# LOBBY_PASSWD=$(cat /run/secrets/psql_lobby_passwd)
# GAME_PASSWD=$(cat /run/secrets/psql_game_passwd)
# CHAT_PASSWD=$(cat /run/secrets/psql_chat_passwd)
SERVICES_PASSWD=$(cat /run/secrets/psql_services_passwd)

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	-- Create schemas
	CREATE SCHEMA IF NOT EXISTS auth;
	CREATE SCHEMA IF NOT EXISTS player;
	CREATE SCHEMA IF NOT EXISTS lobby;
	CREATE SCHEMA IF NOT EXISTS game;
	CREATE SCHEMA IF NOT EXISTS chat;

	-- Create service users
	CREATE USER auth_user WITH PASSWORD '$SERVICES_PASSWD';
	CREATE USER player_user WITH PASSWORD '$SERVICES_PASSWD';
	CREATE USER lobby_user WITH PASSWORD '$SERVICES_PASSWD';
	CREATE USER game_user WITH PASSWORD '$SERVICES_PASSWD';
	CREATE USER chat_user WITH PASSWORD '$SERVICES_PASSWD';

	-- Permissions : each user has access only to their own schema
	GRANT USAGE, CREATE ON SCHEMA auth TO auth_user;
	GRANT USAGE, CREATE ON SCHEMA player TO player_user;
	GRANT USAGE, CREATE ON SCHEMA lobby TO lobby_user;
	GRANT USAGE, CREATE ON SCHEMA game TO game_user;
	GRANT USAGE, CREATE ON SCHEMA chat TO chat_user;

	-- Permissions on future tables
	ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO auth_user;
	ALTER DEFAULT PRIVILEGES IN SCHEMA player GRANT ALL ON TABLES TO player_user;
	ALTER DEFAULT PRIVILEGES IN SCHEMA lobby GRANT ALL ON TABLES TO lobby_user;
	ALTER DEFAULT PRIVILEGES IN SCHEMA game GRANT ALL ON TABLES TO game_user;
	ALTER DEFAULT PRIVILEGES IN SCHEMA chat GRANT ALL ON TABLES TO chat_user;
EOSQL