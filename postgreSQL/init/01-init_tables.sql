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
);

-- Index for faster lookups
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_username ON auth.users(username);

RESET ROLE;