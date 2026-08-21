-- Create telegram_messages table
CREATE TABLE IF NOT EXISTS public.telegram_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on chat_id and created_at to make retrieving context fast
CREATE INDEX IF NOT EXISTS telegram_messages_chat_id_created_at_idx 
    ON public.telegram_messages(chat_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;

-- Note: The admin client uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
-- No public read/write access is allowed for security reasons.
