-- =========================================
-- TRIGGER SHARED FUNCTION
-- =========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_updated_at() TO auth_user, player_user, lobby_user, game_user;


-- =========================================
-- AUTH SCHEMA
-- =========================================

-- Ensures auth_user owns the tables and has full permissions
SET ROLE auth_user;

CREATE TABLE auth.users (
	id UUID			PRIMARY KEY DEFAULT gen_random_uuid(),
	email			TEXT UNIQUE NOT NULL CHECK (length(email) <= 255 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
	username		TEXT UNIQUE NOT NULL CHECK (length(username) <= 50 AND username ~* '^[A-Za-z0-9_-]{3,}$')
	password_hash	TEXT NOT NULL CHECK (length(password_hash) <= 255),
	-- is_verified		BOOLEAN DEFAULT FALSE,
	-- is_active		BOOLEAN DEFAULT TRUE,
	created_at		TIMESTAMPTZ DEFAULT NOW()
	-- updated_at		TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_username ON auth.users(username);

-- CREATE TRIGGER update_users_updated_at
-- 	BEFORE UPDATE ON auth.users
-- 	FOR EACH ROW
-- 	EXECUTE FUNCTION update_updated_at();

RESET ROLE;


-- ==============================
-- PLAYER SCHEMA
-- ==============================

SET ROLE player_user;

-- Tables creation + trigger here...

RESET ROLE;


-- ==============================
-- LOBBY SCHEMA
-- ==============================

SET ROLE lobby_user;

-- Tables creation + trigger here...

RESET ROLE;


-- ==============================
-- GAME SCHEMA
-- ==============================

SET ROLE game_user;

-- Tables creation + trigger here...

RESET ROLE;


-- ==============================
-- CHAT SCHEMA
-- ==============================

SET ROLE chat_user;

CREATE TABLE chat.messages (
	id UUID			PRIMARY KEY DEFAULT gen_random_uuid(),

);

RESET ROLE;