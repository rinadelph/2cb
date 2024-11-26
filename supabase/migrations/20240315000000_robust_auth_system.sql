-- Enable necessary extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS cron;

-- Grant usage to postgres
GRANT USAGE ON SCHEMA cron TO postgres;

-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted', 'pending_verification');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('active', 'expired', 'revoked');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE deletion_status AS ENUM ('pending', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create or update users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    status user_status DEFAULT 'pending_verification',
    email_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    remember_token TEXT,
    reset_password_token TEXT,
    reset_password_sent_at TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ
);

-- Create or update sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    status session_status DEFAULT 'active',
    device_info JSONB,
    ip_address INET,
    last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create or update account_deletions table
CREATE TABLE IF NOT EXISTS account_deletions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status deletion_status DEFAULT 'pending',
    reason TEXT,
    requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    recovery_available_until TIMESTAMPTZ,
    metadata JSONB
);

-- Create or update security_logs table
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create or update password_history table
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    encrypted_password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes if they don't exist
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_account_deletions_user_id ON account_deletions(user_id);
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

-- Create or replace functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist
DO $$ BEGIN
    CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_sessions_updated_at
        BEFORE UPDATE ON sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create or replace security functions
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_ip_address INET,
    p_user_agent TEXT,
    p_details JSONB
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO security_logs (user_id, event_type, ip_address, user_agent, details)
    VALUES (p_user_id, p_event_type, p_ip_address, p_user_agent, p_details)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Create or replace session management functions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS void AS $$
BEGIN
    UPDATE sessions 
    SET status = 'expired'
    WHERE status = 'active' 
    AND expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create or replace account deletion functions
CREATE OR REPLACE FUNCTION process_account_deletion() RETURNS void AS $$
BEGIN
    -- Move completed deletions
    UPDATE account_deletions
    SET status = 'completed',
        completed_at = CURRENT_TIMESTAMP
    WHERE status = 'pending'
    AND recovery_available_until < CURRENT_TIMESTAMP;

    -- Update user status for completed deletions
    UPDATE users u
    SET status = 'deleted'
    FROM account_deletions ad
    WHERE u.id = ad.user_id
    AND ad.status = 'completed'
    AND u.status != 'deleted';
END;
$$ LANGUAGE plpgsql;

-- Create scheduled jobs if they don't exist
DO $$ 
BEGIN
    -- Try to create the scheduled jobs
    IF EXISTS (
        SELECT 1 
        FROM pg_extension 
        WHERE extname = 'pg_cron'
    ) THEN
        -- Schedule session cleanup
        PERFORM cron.schedule(
            'cleanup-expired-sessions',
            '*/15 * * * *',
            'call cleanup_expired_sessions()'
        );

        -- Schedule account deletion processing
        PERFORM cron.schedule(
            'process-account-deletions',
            '0 * * * *',
            'call process_account_deletion()'
        );
    ELSE 
        RAISE NOTICE 'pg_cron extension is not available. Scheduled jobs were not created.';
    END IF;
EXCEPTION 
    WHEN OTHERS THEN 
        RAISE NOTICE 'Could not create scheduled jobs: %', SQLERRM;
END $$;

-- Add RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view their own sessions"
    ON sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions"
    ON sessions FOR ALL
    USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE sessions IS 'Tracks user sessions across devices';
COMMENT ON TABLE security_logs IS 'Audit log for security-related events';
COMMENT ON TABLE account_deletions IS 'Manages account deletion requests and process';
COMMENT ON TABLE password_history IS 'Tracks password changes for security purposes'; 