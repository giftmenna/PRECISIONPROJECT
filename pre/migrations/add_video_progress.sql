-- Add video progress tracking to learning_attempts table
ALTER TABLE "learning_attempts" 
ADD COLUMN IF NOT EXISTS "videoProgress" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "videoCompleted" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "lastWatchedAt" TIMESTAMP;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS "idx_learning_attempts_user_module" 
ON "learning_attempts"("userId", "moduleId");

-- Comment explaining the new fields
COMMENT ON COLUMN "learning_attempts"."videoProgress" IS 'Video watch progress in seconds';
COMMENT ON COLUMN "learning_attempts"."videoCompleted" IS 'Whether user has completed watching the video';
COMMENT ON COLUMN "learning_attempts"."lastWatchedAt" IS 'Last time user watched the video';
