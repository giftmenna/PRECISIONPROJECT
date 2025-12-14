-- Fix Schema Issue - Move All Tables to Public Schema
-- Run this in Supabase SQL Editor to fix the schema problem

-- First, drop all tables from wrong schemas
DROP SCHEMA IF EXISTS extensions CASCADE;

-- Ensure we're working in public schema
SET search_path TO public;

-- Drop any existing tables in public schema to start fresh
DROP TABLE IF EXISTS "group_chat_messages" CASCADE;
DROP TABLE IF EXISTS "group_chat_members" CASCADE;
DROP TABLE IF EXISTS "group_chats" CASCADE;
DROP TABLE IF EXISTS "ai_messages" CASCADE;
DROP TABLE IF EXISTS "ai_conversations" CASCADE;
DROP TABLE IF EXISTS "learning_question_attempts" CASCADE;
DROP TABLE IF EXISTS "learning_attempts" CASCADE;
DROP TABLE IF EXISTS "learning_questions" CASCADE;
DROP TABLE IF EXISTS "learning_modules" CASCADE;
DROP TABLE IF EXISTS "daily_lesson_watches" CASCADE;
DROP TABLE IF EXISTS "daily_lessons" CASCADE;
DROP TABLE IF EXISTS "test_attempts" CASCADE;
DROP TABLE IF EXISTS "test_sets" CASCADE;
DROP TABLE IF EXISTS "ad_watches" CASCADE;
DROP TABLE IF EXISTS "push_subscriptions" CASCADE;
DROP TABLE IF EXISTS "notification_settings" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "grade_competition_image_uploads" CASCADE;
DROP TABLE IF EXISTS "grade_competition_results" CASCADE;
DROP TABLE IF EXISTS "grade_competition_entries" CASCADE;
DROP TABLE IF EXISTS "grade_competition_questions" CASCADE;
DROP TABLE IF EXISTS "grade_competitions" CASCADE;
DROP TABLE IF EXISTS "competition_leaderboards" CASCADE;
DROP TABLE IF EXISTS "drop_answers" CASCADE;
DROP TABLE IF EXISTS "drop_attempts" CASCADE;
DROP TABLE IF EXISTS "drop_questions" CASCADE;
DROP TABLE IF EXISTS "competition_drops" CASCADE;
DROP TABLE IF EXISTS "competition_image_uploads" CASCADE;
DROP TABLE IF EXISTS "competition_entries" CASCADE;
DROP TABLE IF EXISTS "competitions" CASCADE;
DROP TABLE IF EXISTS "attempt_answers" CASCADE;
DROP TABLE IF EXISTS "attempts" CASCADE;
DROP TABLE IF EXISTS "weekly_test_questions" CASCADE;
DROP TABLE IF EXISTS "weekly_tests" CASCADE;
DROP TABLE IF EXISTS "practice_attempts" CASCADE;
DROP TABLE IF EXISTS "questions" CASCADE;
DROP TABLE IF EXISTS "math_questions" CASCADE;
DROP TABLE IF EXISTS "topics" CASCADE;
DROP TABLE IF EXISTS "gem_rates" CASCADE;
DROP TABLE IF EXISTS "payment_transactions" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "wallet_ledger" CASCADE;
DROP TABLE IF EXISTS "wallets" CASCADE;
DROP TABLE IF EXISTS "otp_codes" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Enable UUID extension in public schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;

-- Now create all tables in PUBLIC schema explicitly
CREATE TABLE public."users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'user',
    "grade" TEXT,
    "avatar" TEXT,
    "ipAddress" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "age" INTEGER,
    "country" TEXT,
    "gender" TEXT
);

CREATE TABLE public."otp_codes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public."wallets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "gemsBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES public."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE public."wallet_ledger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("walletId") REFERENCES public."wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE public."topics" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "defaultGems" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public."gem_rates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rateGemPerNgn" DECIMAL(65,30) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT INTO public."topics" ("key", "displayName", "defaultGems") VALUES
('algebra', 'Algebra', 3),
('geometry', 'Geometry', 3),
('calculus', 'Calculus', 4),
('statistics', 'Statistics', 3),
('trigonometry', 'Trigonometry', 3),
('physics', 'Physics', 4),
('chemistry', 'Chemistry', 4),
('biology', 'Biology', 3),
('english', 'English', 2),
('literature', 'Literature', 2);

INSERT INTO public."gem_rates" ("id", "rateGemPerNgn") VALUES
('default_rate', 0.1);

-- Verify tables are in public schema
SELECT 'SUCCESS: Core tables created in PUBLIC schema' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
