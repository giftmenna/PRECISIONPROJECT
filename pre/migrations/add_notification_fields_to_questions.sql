-- Add notification fields to math_questions table
ALTER TABLE math_questions 
ADD COLUMN IF NOT EXISTS notifyUsers BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notifiedAt TIMESTAMP;

-- Add comment
COMMENT ON COLUMN math_questions.notifyUsers IS 'Whether to notify users when this question is created';
COMMENT ON COLUMN math_questions.notifiedAt IS 'Timestamp when users were notified about this question';
