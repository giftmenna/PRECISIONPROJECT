-- Migration: Change videoProgress from INT to FLOAT in learning_attempts table
-- This allows storing percentage values (0-100) with decimal precision

ALTER TABLE "public"."learning_attempts" 
ALTER COLUMN "videoProgress" TYPE DOUBLE PRECISION USING "videoProgress"::DOUBLE PRECISION;

-- Update comment
COMMENT ON COLUMN "public"."learning_attempts"."videoProgress" IS 'Video watch progress as percentage (0-100)';
