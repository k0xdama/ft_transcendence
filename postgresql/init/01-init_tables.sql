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
--					CHAT SCHEMA
--					 5 tables
-- ==============================================

SET ROLE chat_user;

-- Lobby-related lifecycle
CREATE TABLE chat.lobby_sessions (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	room_id			UUID NOT NULL UNIQUE,
	status			TEXT NOT NULL DEFAULT 'open'
		CONSTRAINT check_lobby_session_status
		CHECK (status IN ('open', 'closing', 'closed')),
	opened_at		TIMESTAMPTZ DEFAULT NOW(),
	game_ended_at	TIMESTAMPTZ,
	closes_at		TIMESTAMPTZ,
	updated_at		TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lobby_session_lookup
	ON chat.lobby_sessions(room_id, status);

-- Chat in-game
CREATE TABLE chat.lobby_messages (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	room_id			UUID NOT NULL REFERENCES chat.lobby_sessions(room_id) ON DELETE CASCADE,
	sender_id		UUID NOT NULL,
	username		TEXT NOT NULL,
	content			TEXT NOT NULL
		CONSTRAINT check_lobby_msg_content_length
		CHECK (char_length(content) BETWEEN 1 AND 500),
	message_type	TEXT NOT NULL DEFAULT 'user_text'
		CONSTRAINT check_lobby_msg_type
		CHECK (message_type IN ('user_text', 'suggestion')),
	created_at		TIMESTAMPTZ DEFAULT NOW(),
	expires_at		TIMESTAMPTZ
);

CREATE INDEX idx_lobby_recent
	ON chat.lobby_messages(room_id, created_at DESC);

CREATE INDEX idx_lobby_expiry
	ON chat.lobby_messages(expires_at);

-------------------------------------------------
-- Chat DM
CREATE TABLE chat.direct_conversations (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user1_id		UUID NOT NULL,
	user2_id		UUID NOT NULL,
	created_at 		TIMESTAMPTZ DEFAULT NOW(),
	CONSTRAINT check_different_users	-- Prevents a user from DMing themselves
		CHECK (user1_id <> user2_id),
	CONSTRAINT check_user_order			-- Require user1 < user2 to avoid duplicates (1-2, 2-1)
		CHECK (user1_id < user2_id),
	CONSTRAINT check_one_conversation_per_pair
		UNIQUE (user1_id, user2_id)
);

CREATE TABLE chat.direct_messages (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	conversation_id	UUID NOT NULL REFERENCES chat.direct_conversations(id) ON DELETE CASCADE,
	sender_id		UUID NOT NULL,
	content			TEXT NOT NULL
		CONSTRAINT check_dm_content_length
		CHECK (char_length(content) BETWEEN 1 AND 500),
	created_at		TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dm_recent
	ON chat.direct_messages(conversation_id, created_at DESC);

-------------------------------------------------
CREATE TABLE chat.blocked_users (
	blocker_id		UUID NOT NULL,
	blocked_id		UUID NOT NULL,
	created_at		TIMESTAMPTZ DEFAULT NOW(),
	PRIMARY KEY (blocker_id, blocked_id),
	CONSTRAINT check_no_self_block
	CHECK (blocker_id != blocked_id)
);

CREATE INDEX idx_blocker_lookup
	ON chat.blocked_users(blocker_id, blocked_id);

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

-- LE MIENS EST OBSOLETE
-- -- =========================================
-- -- AUTH SCHEMA
-- -- =========================================

-- -- Ensures auth_user owns the tables and has full permissions
-- SET ROLE auth_user;

-- CREATE TABLE auth.users (
-- 	id UUID			PRIMARY KEY DEFAULT gen_random_uuid(),
-- 	email			VARCHAR(255) UNIQUE NOT NULL,
-- 	username		VARCHAR(50) UNIQUE NOT NULL,
-- 	password		VARCHAR(255) NOT NULL,
-- 	-- is_verified		BOOLEAN DEFAULT FALSE,
-- 	-- is_active		BOOLEAN DEFAULT TRUE,
-- 	created_at		TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- 	-- updated_at		TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Index for faster lookups
-- CREATE INDEX idx_users_email ON auth.users(email);
-- CREATE INDEX idx_users_username ON auth.users(username);

-- -- CREATE TRIGGER update_users_updated_at
-- -- 	BEFORE UPDATE ON auth.users
-- -- 	FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RESET ROLE;
-- LE MIENS EST OBSOLETE

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
	created_at		TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	-- updated_at		TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

	-- STATS DATA
	won				INTEGER DEFAULT 0,
	rank			INTEGER DEFAULT 0,
	score			INTEGER DEFAULT 0,
	actions_played	INTEGER DEFAULT 0,
	combo			INTEGER DEFAULT 0,
	trio_of_7		INTEGER DEFAULT 0,
	perfect_game	INTEGER DEFAULT 0

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
-- CREATE TRIGGER trg_lobby_sessions_updated_at
-- 	BEFORE UPDATE ON chat.lobby_sessions
-- 	FOR EACH ROW
-- 	EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_lobby_sessions_updated_at
	BEFORE UPDATE ON chat.lobby_sessions
	FOR EACH ROW
	EXECUTE FUNCTION set_updated_at();

-------------------------------------------------
CREATE OR REPLACE FUNCTION chat.set_lobby_closes_at()
RETURNS TRIGGER AS $$
BEGIN
	-- Triggers only when game_ended_at changes from NULL to a value
	IF NEW.game_ended_at IS NOT NULL AND OLD.game_ended_at IS NULL THEN
		NEW.closes_at = NEW.game_ended_at + INTERVAL '3 minutes';
		NEW.status	  = 'closing';
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

---
CREATE TRIGGER trg_lobby_session_closes_at
	BEFORE UPDATE ON chat.lobby_sessions
	FOR EACH ROW
	EXECUTE FUNCTION chat.set_lobby_closes_at();

-------------------------------------------------
CREATE OR REPLACE FUNCTION chat.set_lobby_message_expiry()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
	NEW.expires_at := NEW.created_at + INTERVAL '7 days';
	RETURN NEW;
END;
$$;

--
CREATE TRIGGER trg_lobby_messages_expiry
	BEFORE INSERT ON chat.lobby_messages
	FOR EACH ROW
	EXECUTE FUNCTION chat.set_lobby_message_expiry();
