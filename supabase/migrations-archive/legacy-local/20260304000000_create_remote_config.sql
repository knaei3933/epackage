-- ============================================
-- remote_config table
-- ============================================
-- Stores remote configuration values for the application
-- such as maintenance mode, chatbot backend settings, etc.

CREATE TABLE IF NOT EXISTS public.remote_config (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.remote_config ENABLE ROW LEVEL SECURITY;

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_remote_config_key ON public.remote_config(key);

-- RLS Policies
-- Public read access (no auth required)
CREATE POLICY "Public read access on remote_config"
ON public.remote_config
FOR SELECT
TO public
USING (true);

-- Service role only write access
CREATE POLICY "Service role insert on remote_config"
ON public.remote_config
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role update on remote_config"
ON public.remote_config
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role delete on remote_config"
ON public.remote_config
FOR DELETE
TO service_role
USING (true);

-- Seed initial data
INSERT INTO public.remote_config (key, value)
VALUES
    ('maintenance_mode', '{"enabled": false, "message": ""}'::jsonb),
    ('chatbot_backend', '{"provider": "lmstudio", "failover_enabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- chatbot_failover_logs table
-- ============================================
-- Logs failover events for chatbot backend provider switching

CREATE TABLE IF NOT EXISTS public.chatbot_failover_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    from_provider TEXT,
    to_provider TEXT,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chatbot_failover_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_chatbot_failover_logs_event_type ON public.chatbot_failover_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_chatbot_failover_logs_created_at ON public.chatbot_failover_logs(created_at DESC);

-- RLS Policies
-- Service role only access
CREATE POLICY "Service role select on chatbot_failover_logs"
ON public.chatbot_failover_logs
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role insert on chatbot_failover_logs"
ON public.chatbot_failover_logs
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role delete on chatbot_failover_logs"
ON public.chatbot_failover_logs
FOR DELETE
TO service_role
USING (true);

-- ============================================
-- Helper function to get remote config value
-- ============================================
CREATE OR REPLACE FUNCTION public.get_remote_config(p_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN COALESCE(
        (SELECT value FROM public.remote_config WHERE key = p_key),
        '{}'::jsonb
    );
END;
$$;

-- Grant execute to public (for read-only configs)
GRANT EXECUTE ON FUNCTION public.get_remote_config(TEXT) TO public;
