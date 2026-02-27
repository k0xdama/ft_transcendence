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

GRANT EXECUTE ON FUNCTION update_updated_at() TO auth_user, player_user, lobby_user, game_user, chat_user;


-- =========================================
-- AUTH SCHEMA
-- =========================================

-- Ensures auth_user owns the tables and has full permissions
SET ROLE auth_user;

CREATE TABLE auth.users (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email			TEXT UNIQUE NOT NULL
		CONSTRAINT check_email_format
		CHECK (length(email) <= 255 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
	username		TEXT UNIQUE NOT NULL
		CONSTRAINT check_username_format
		CHECK (length(username) BETWEEN 3 AND 50 AND username ~* '^[A-Za-z0-9_-]+$'),
	password_hash	TEXT NOT NULL
		CONSTRAINT check_password_hash_length
		CHECK (length(password_hash) <= 255),
	-- is_verified		BOOLEAN DEFAULT FALSE,
	-- is_active		BOOLEAN DEFAULT TRUE,
	created_at		TIMESTAMPTZ DEFAULT NOW(),
	-- updated_at		TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_username ON auth.users(username);

CREATE TABLE auth.refresh_tokens (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id			UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	token_hash		TEXT NOT NULL UNIQUE
		CONSTRAINT check_token_hash_length
		CHECK (length(token_hash) = 64),
	created_at		TIMESTAMPTZ DEFAULT NOW(),
	expires_at		TIMESTAMPTZ NOT NULL
);

-- CREATE TRIGGER update_users_updated_at
-- 	BEFORE UPDATE ON auth.users
-- 	FOR EACH ROW
-- 	EXECUTE FUNCTION update_updated_at();

RESET ROLE;


-- ==============================
-- CHAT SCHEMA
-- ==============================

SET ROLE chat_user;

-- Chat in-game
CREATE TABLE chat.lobby_messages (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	lobby_id		UUID NOT NULL, -- refers to lobby.rooms
	sender_id		UUID NOT NULL,
	content			TEXT NOT NULL
		CONSTRAINT check_lobby_msg_content_length
		CHECK (char_length(content) BETWEEN 1 AND 500),
	message_type	TEXT NOT NULL DEFAULT 'user_text'
		CONSTRAINT check_lobby_msg_type
		CHECK (message_type IN ('user_text', 'quick_chat')),
	created_at		TIMESTAMPTZ DEFAULT NOW(),
	expires_at		TIMESTAMP GENERATED ALWAYS AS
		((created_at AT TIME ZONE 'UTC')::timestamp + INTERVAL '7 days') STORED
);

CREATE INDEX idx_lobby_recent ON chat.lobby_messages(lobby_id, created_at DESC);

-- Chat DM/Group
CREATE TABLE chat.conversations (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	type			TEXT NOT NULL
		CONSTRAINT check_conversation_type
		CHECK (type IN ('direct', 'group')),
	name			TEXT
		CONSTRAINT check_conversation_name_length
		CHECK (name IS NULL OR char_length(name) BETWEEN 3 AND 50), -- group name
	created_at		TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat.conversation_participants (
	conversation_id		UUID NOT NULL REFERENCES chat.conversations(id) ON DELETE CASCADE,
	user_id				UUID NOT NULL,
	joined_at			TIMESTAMPTZ DEFAULT NOW(),
	PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE chat.conversation_messages (
	id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	conversation_id	UUID NOT NULL REFERENCES chat.conversations(id) ON DELETE CASCADE,
	sender_id		UUID NOT NULL,
	content			TEXT NOT NULL
		CONSTRAINT check_conversation_msg_content_length
		CHECK (char_length(content) BETWEEN 1 AND 500),
	created_at		TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversation_recent ON chat.conversation_messages(conversation_id, created_at DESC);

CREATE TABLE chat.blocked_users (
	blocker_id		UUID NOT NULL,
	blocked_id		UUID NOT NULL,
	created_at		TIMESTAMPTZ DEFAULT NOW(),
	PRIMARY KEY (blocker_id, blocked_id),
	CONSTRAINT check_no_self_block
	CHECK (blocker_id != blocked_id)
);

CREATE INDEX idx_blocker_lookup ON chat.blocked_users(blocker_id, blocked_id);

RESET ROLE;