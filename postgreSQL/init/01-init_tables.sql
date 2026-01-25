-- ===================
-- AUTH SCHEMA
-- ===================

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

CREATE TABLE auth.refresh_tokens (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	token_hash VARCHAR(255) NOT NULL,
	expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Index for faster lookups
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_username ON auth.users(username);
CREATE INDEX idx_refresh_tokens_user_id ON auth.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON auth.refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON auth.refresh_tokens(expires_at) WHERE revoked_at IS NULL;

-- ===================
-- PLAYER SCHEMA
-- ===================

CREATE TABLE player.profiles (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID UNIQUE NOT NULL,
	display_name VARCHAR(50),
	avatar_url VARCHAR(500),
	bio TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE player.friendships (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL,
	friend_id UUID NOT NULL,
	status VARCHAR(20) DEFAULT 'pending', -- pending, accepted
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(user_id, friend_id)
);

-- ===================
-- LOBBY SCHEMA
-- ===================

CREATE TABLE lobby.rooms (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(100) NOT NULL,
	owner_id UUID NOT NULL,
	status VARCHAR(20) DEFAULT 'waiting', -- waiting, ready, in_game, closed
	max_players INTEGER DEFAULT 2,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lobby.room_players (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	room_id UUID NOT NULL REFERENCES lobby.rooms(id) ON DELETE CASCADE,
	user_id UUID NOT NULL,
	is_ready BOOLEAN DEFAULT FALSE,
	joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(room_id, user_id)
);

-- ===================
-- GAME SCHEMA
-- ===================

CREATE TABLE game.games (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	room_id UUID,
	status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, cancelled
	winner_id UUID,
	config JSONB DEFAULT '{}',
	started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	ended_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE game.game_players (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	game_id UUID NOT NULL REFERENCES game.games(id) ON DELETE CASCADE,
	user_id UUID NOT NULL,
	score INTEGER DEFAULT 0,
	role VARCHAR(50),
	UNIQUE(game_id, user_id)
);

-- ===================
-- CHAT SCHEMA
-- ===================

CREATE TABLE chat.conversations (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	type VARCHAR(20) DEFAULT 'direct', -- direct, group
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat.conversation_participants (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	conversation_id UUID NOT NULL REFERENCES chat.conversations(id) ON DELETE CASCADE,
	user_id UUID NOT NULL,
	joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(conversation_id, user_id)
);

CREATE TABLE chat.messages (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	conversation_id UUID NOT NULL REFERENCES chat.conversations(id) ON DELETE CASCADE,
	sender_id UUID NOT NULL,
	content TEXT NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON chat.messages(conversation_id);
CREATE INDEX idx_messages_created ON chat.messages(created_at);

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

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON auth.users
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON player.profiles
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON player.friendships
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON lobby.rooms
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON chat.messages
	FOR EACH ROW EXECUTE FUNCTION update_updated_at();