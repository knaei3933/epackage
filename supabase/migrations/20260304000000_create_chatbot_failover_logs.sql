-- Chatbot Failover Logs Table
-- チャットボット フェイルオーバーログテーブル
-- Records when the chatbot fails over from LM Studio to commercial APIs

CREATE TABLE IF NOT EXISTS public.chatbot_failover_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Original provider info
    original_provider TEXT NOT NULL DEFAULT 'lmstudio',
    original_error_message TEXT,
    original_error_code TEXT,

    -- Failover provider info
    failover_provider TEXT NOT NULL,
    failover_enabled BOOLEAN NOT NULL DEFAULT true,

    -- Request context
    user_message_preview TEXT,
    session_id TEXT,

    -- Performance tracking
    response_time_ms INTEGER,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'failed', -- 'failed', 'success', 'error'
    resolved BOOLEAN NOT NULL DEFAULT false,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS chatbot_failover_logs_created_at_idx ON public.chatbot_failover_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS chatbot_failover_logs_status_idx ON public.chatbot_failover_logs(status);
CREATE INDEX IF NOT EXISTS chatbot_failover_logs_failover_provider_idx ON public.chatbot_failover_logs(failover_provider);

-- Add RLS policies
ALTER TABLE public.chatbot_failover_logs ENABLE ROW LEVEL SECURITY;

-- Service role can insert logs (used by API routes)
CREATE POLICY IF NOT EXISTS "Service role can insert failover logs"
    ON public.chatbot_failover_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Service role can read all logs
CREATE POLICY IF NOT EXISTS "Service role can read failover logs"
    ON public.chatbot_failover_logs
    FOR SELECT
    TO service_role
    USING (true);

-- Add comment
COMMENT ON TABLE public.chatbot_failover_logs IS 'Logs for chatbot provider failover events when LM Studio is unavailable';
