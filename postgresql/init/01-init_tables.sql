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
	created_at		TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
	id 				SERIAL PRIMARY KEY,
	auth_user_id	UUID UNIQUE NOT NULL,
	email			VARCHAR(255) UNIQUE NOT NULL,
	username		VARCHAR(50) UNIQUE NOT NULL,
	pp_path			VARCHAR(255) NOT NULL,
	-- is_verified		BOOLEAN DEFAULT FALSE,
	-- is_active		BOOLEAN DEFAULT TRUE,
	created_at		TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	-- updated_at		TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_player_auth_user_id ON player.users(auth_user_id);
CREATE INDEX idx_player_username ON player.users(username);
CREATE INDEX idx_player_email ON player.users(email);

-- ==============================
-- FRIEND SCHEMA
-- ==============================

-- Créer le type ENUM pour les statuts
CREATE TYPE player.friendship_status AS ENUM ('pending', 'accepted', 'blocked');

-- Table des amitiés
CREATE TABLE player.friendships (
    id              SERIAL PRIMARY KEY,
    requester_id    INTEGER NOT NULL REFERENCES player.users(id) ON DELETE CASCADE,
    addressee_id    INTEGER NOT NULL REFERENCES player.users(id) ON DELETE CASCADE,
    status          player.friendship_status DEFAULT 'pending',
    requested_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at    TIMESTAMP WITH TIME ZONE,
    
    -- Contrainte : une seule relation par paire (dans un seul sens)
    CONSTRAINT unique_friendship_pair UNIQUE (requester_id, addressee_id),
    
    -- Contrainte : pas d'auto-amitié
    CONSTRAINT no_self_friendship CHECK (requester_id != addressee_id)
);

-- Index pour performance
CREATE INDEX idx_friendships_requester ON player.friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON player.friendships(addressee_id);
CREATE INDEX idx_friendships_status ON player.friendships(status);
CREATE INDEX idx_friendships_both ON player.friendships(requester_id, addressee_id);

-- Commentaires
COMMENT ON TABLE player.friendships IS 'Table des relations d''amitié entre joueurs';
COMMENT ON COLUMN player.friendships.requester_id IS 'ID du joueur qui a envoyé la demande';
COMMENT ON COLUMN player.friendships.addressee_id IS 'ID du joueur qui reçoit la demande';
COMMENT ON COLUMN player.friendships.status IS 'Statut de la relation : pending, accepted, blocked';

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