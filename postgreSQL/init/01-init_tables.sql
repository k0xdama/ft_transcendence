-- ===================
-- AUTH SCHEMA
-- ===================

SET search_path TO auth;

ALTER SCHEMA auth OWNER TO auth_user;

CREATE TABLE users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email VARCHAR(255) UNIQUE NOT NULL,
	username VARCHAR(50) UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	-- is_verified BOOLEAN DEFAULT FALSE,
	-- is_active BOOLEAN DEFAULT TRUE,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	-- updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- -- ==============================
-- -- UPDATED_AT TRIGGER FUNCTION
-- -- ==============================

-- CREATE OR REPLACE FUNCTION update_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
-- 	NEW.updated_at = CURRENT_TIMESTAMP;
-- 	RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON auth.users
-- 	FOR EACH ROW EXECUTE FUNCTION update_updated_at();