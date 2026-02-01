-- ===================
-- AUTH SCHEMA
-- ===================

-- Switch to auth_user for table creation
-- This ensures auth_user owns the tables and has full permissions
SET ROLE auth_user;

CREATE TABLE auth.users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email VARCHAR(255) UNIQUE NOT NULL,
	username VARCHAR(50) UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	is_verified BOOLEAN DEFAULT FALSE,
	is_active BOOLEAN DEFAULT TRUE,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CREATE TABLE auth.refresh_tokens (
-- 	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
-- 	user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
-- 	token_hash VARCHAR(255) NOT NULL,
-- 	expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
-- 	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
-- 	revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
-- );

-- Index for faster lookups
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_username ON auth.users(username);
-- CREATE INDEX idx_refresh_tokens_user_id ON auth.refresh_tokens(user_id);
-- CREATE INDEX idx_refresh_tokens_hash ON auth.refresh_tokens(token_hash);
-- CREATE INDEX idx_refresh_tokens_expires ON auth.refresh_tokens(expires_at) WHERE revoked_at IS NULL;

-- Reset to superuser for trigger creation
RESET ROLE;

-- ==============================
-- UPDATED_AT TRIGGER FUNCTION
-- ==============================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = CURRENT_TIMESTAMP;
	RETURN NEW;
END;
$$ language 'plpgsql';

-- Grant execute to all service users
GRANT EXECUTE ON FUNCTION update_updated_at() TO auth_user; -- add player_user, lobby_user, game_user, chat_user;

CREATE TRIGGER update_users_updated_at
	BEFORE UPDATE ON auth.users
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();