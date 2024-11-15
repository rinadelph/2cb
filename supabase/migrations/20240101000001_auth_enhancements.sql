-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE account_deletion_status AS ENUM ('pending', 'cancelled', 'completed');
CREATE TYPE session_status AS ENUM ('active', 'expired', 'revoked');

-- Create account_deletions table
CREATE TABLE public.account_deletions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    feedback TEXT,
    requested_at TIMESTAMPTZ NOT NULL,
    scheduled_deletion_date TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status account_deletion_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_sessions table to track active sessions
CREATE TABLE public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    session_id TEXT NOT NULL,
    status session_status DEFAULT 'active',
    browser TEXT,
    os TEXT,
    ip_address TEXT,
    last_active TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create session_activity table for audit logging
CREATE TABLE public.session_activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    session_id UUID REFERENCES public.user_sessions(id),
    action TEXT NOT NULL,
    browser TEXT,
    os TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_data_exports table
CREATE TABLE public.user_data_exports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT DEFAULT 'pending',
    download_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER set_account_deletions_updated_at
    BEFORE UPDATE ON public.account_deletions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_user_sessions_updated_at
    BEFORE UPDATE ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_user_data_exports_updated_at
    BEFORE UPDATE ON public.user_data_exports
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Create function to process account deletions
CREATE OR REPLACE FUNCTION process_account_deletions()
RETURNS void AS $$
DECLARE
    deletion_record RECORD;
BEGIN
    FOR deletion_record IN
        SELECT * FROM public.account_deletions
        WHERE status = 'pending'
        AND scheduled_deletion_date <= now()
    LOOP
        -- Update deletion status
        UPDATE public.account_deletions
        SET status = 'completed',
            completed_at = now()
        WHERE id = deletion_record.id;

        -- Disable user account
        UPDATE auth.users
        SET raw_app_meta_data = 
            jsonb_set(
                COALESCE(raw_app_meta_data, '{}'::jsonb),
                '{deleted}',
                'true'
            )
        WHERE id = deletion_record.user_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    UPDATE public.user_sessions
    SET status = 'expired'
    WHERE status = 'active'
    AND expires_at <= now();

    INSERT INTO public.session_activity (user_id, session_id, action)
    SELECT user_id, id, 'expired'
    FROM public.user_sessions
    WHERE status = 'expired'
    AND updated_at >= now() - interval '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up RLS policies
ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data_exports ENABLE ROW LEVEL SECURITY;

-- Account deletions policies
CREATE POLICY "Users can view their own deletion requests"
    ON public.account_deletions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deletion requests"
    ON public.account_deletions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Session policies
CREATE POLICY "Users can view their own sessions"
    ON public.user_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
    ON public.user_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Activity policies
CREATE POLICY "Users can view their own activity"
    ON public.session_activity
    FOR SELECT
    USING (auth.uid() = user_id);

-- Data export policies
CREATE POLICY "Users can view their own exports"
    ON public.user_data_exports
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can request their own exports"
    ON public.user_data_exports
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create scheduled jobs
SELECT cron.schedule(
    'cleanup-expired-sessions',
    '*/15 * * * *', -- Every 15 minutes
    $$SELECT clean_expired_sessions()$$
);

SELECT cron.schedule(
    'process-account-deletions',
    '0 0 * * *', -- Daily at midnight
    $$SELECT process_account_deletions()$$
);

-- Create indexes for performance
CREATE INDEX idx_account_deletions_user_id ON public.account_deletions(user_id);
CREATE INDEX idx_account_deletions_status ON public.account_deletions(status);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_status ON public.user_sessions(status);
CREATE INDEX idx_session_activity_user_id ON public.session_activity(user_id);
CREATE INDEX idx_user_data_exports_user_id ON public.user_data_exports(user_id); 