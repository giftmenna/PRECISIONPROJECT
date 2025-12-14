-- Create group_chats table
CREATE TABLE IF NOT EXISTS public.group_chats (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Study Group',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "isActive" BOOLEAN DEFAULT true
);

-- Add comments for better documentation
COMMENT ON TABLE public.group_chats IS 'Stores information about group chats';
COMMENT ON COLUMN public.group_chats.id IS 'Primary key, auto-generated UUID';
COMMENT ON COLUMN public.group_chats.name IS 'Name of the group chat';
COMMENT ON COLUMN public.group_chats.description IS 'Optional description of the group chat';
COMMENT ON COLUMN public.group_chats.is_active IS 'Indicates if the group chat is active';
COMMENT ON COLUMN public.group_chats.created_at IS 'Timestamp when the group was created';
COMMENT ON COLUMN public.group_chats.updated_at IS 'Timestamp when the group was last updated';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_chats_is_active ON public.group_chats (is_active);
CREATE INDEX IF NOT EXISTS idx_group_chats_created_at ON public.group_chats (created_at);
