-- =========================================
-- TRIGGER SHARED FUNCTION
-- =========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = CURRENT_TIMESTAMP;
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
	email			VARCHAR(255) UNIQUE NOT NULL,
	username		VARCHAR(50) UNIQUE NOT NULL,
	password		VARCHAR(255) NOT NULL,
	-- is_verified		BOOLEAN DEFAULT FALSE,
	-- is_active		BOOLEAN DEFAULT TRUE,
	created_at		TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	-- updated_at		TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_username ON auth.users(username);

-- CREATE TRIGGER update_users_updated_at
-- 	BEFORE UPDATE ON auth.users
-- 	FOR EACH ROW EXECUTE FUNCTION update_updated_at();

RESET ROLE;


-- ==============================
-- PLAYER SCHEMA
-- ==============================

SET ROLE player_user;

CREATE TABLE player.users (

	name			VARCHAR(50) UNIQUE NOT NULL,
	pp_path			VARCHAR(255) UNIQUE NOT NULL,
	-- doit etre initialisee sur une profil picture par defaut
	friends			INT[],
	-- text et VARCHAR sont geres par varlena, en vrai pas sur d'avoir bien compris la dif https://stackoverflow.com/questions/4848964/difference-between-text-and-varchar-character-varying
	created_at		TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
);

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

-- Tables creation here...

RESET ROLE;