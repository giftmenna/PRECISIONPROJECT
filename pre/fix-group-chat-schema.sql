-- Fix Group Chat Schema Issues
-- Run this in your Supabase SQL Editor

-- 1. Add missing columns to group_chat_members table
ALTER TABLE group_chat_members 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Add missing columns to group_chat_messages table
ALTER TABLE group_chat_messages 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- 3. Add missing columns to ai_conversations table (if they don't exist)
ALTER TABLE ai_conversations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Add trigger to ai_conversations table
DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at 
    BEFORE UPDATE ON ai_conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Add trigger to group_chats table
DROP TRIGGER IF EXISTS update_group_chats_updated_at ON group_chats;
CREATE TRIGGER update_group_chats_updated_at 
    BEFORE UPDATE ON group_chats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Verify the changes
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('group_chats', 'group_chat_members', 'group_chat_messages', 'ai_conversations')
ORDER BY table_name, ordinal_position; 