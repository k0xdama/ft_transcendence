-- ==============================================
--					AUTH SCHEMA
--					 2 tables
-- ==============================================

SET ROLE auth_user;		-- Ensures auth_user owns the tables and has full permissions

CREATE TABLE auth.users (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email			TEXT UNIQUE NOT NULL
		CONSTRAINT check_email_format
		CHECK (length(email) <= 254
			AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
	username		TEXT UNIQUE NOT NULL
		CONSTRAINT check_username_format
		CHECK (length(username) BETWEEN 3 AND 50 
			AND username ~* '^[A-Za-z0-9_-]+$'),
	password_hash	TEXT NOT NULL
		CONSTRAINT check_password_hash_length
		CHECK (length(password_hash) = 60),
	-- is_verified		BOOLEAN DEFAULT FALSE,		-- ajouter pour 2FA module
	-- is_active		BOOLEAN DEFAULT TRUE,
	created_at		TIMESTAMPTZ DEFAULT NOW(),
	updated_at		TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email
	ON auth.users(email);

CREATE INDEX idx_users_username
	ON auth.users(username);

-------------------------------------------------
CREATE TABLE auth.refresh_tokens (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id			UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	token_hash		TEXT NOT NULL UNIQUE
		CONSTRAINT check_token_hash_length
		CHECK (length(token_hash) = 64),
	created_at		TIMESTAMPTZ DEFAULT NOW(),
	expires_at		TIMESTAMPTZ NOT NULL
);

RESET ROLE;

-- ==============================================
--			TRIGGER SHARED FUNCTIONS
--
--	Runs automatically when a specific event
--	occurs on a table (INSERT, UPDATE, DELETE)
-- ==============================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION set_updated_at()
	TO auth_user, player_user, lobby_user, game_user, chat_user;

---
CREATE TRIGGER trg_auth_users_updated_at
	BEFORE UPDATE ON auth.users
	FOR EACH ROW
	EXECUTE FUNCTION set_updated_at();

-- CREATE TRIGGER trg_lobby_sessions_updated_at
-- 	BEFORE UPDATE ON chat.lobby_sessions
-- 	FOR EACH ROW
-- 	EXECUTE FUNCTION set_updated_at();