-- Create ALL Tables in PUBLIC Schema Only
-- Run this AFTER fix-schema-public.sql

-- Questions and Math Questions
CREATE TABLE public."math_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prompt" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "correctChoice" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "topicKey" TEXT,
    "grade" TEXT,
    "gems" INTEGER NOT NULL DEFAULT 2,
    "timeLimit" INTEGER DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("topicKey") REFERENCES public."topics"("key") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE public."questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prompt" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "correctChoice" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "topicKey" TEXT,
    "grade" TEXT,
    "gems" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("topicKey") REFERENCES public."topics"("key") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Weekly Tests
CREATE TABLE public."weekly_tests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekOf" TIMESTAMP(3) NOT NULL UNIQUE,
    "liveAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "gems" INTEGER NOT NULL DEFAULT 10,
    "grade" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public."weekly_test_questions" (
    "weeklyTestId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    PRIMARY KEY ("weeklyTestId", "questionId"),
    FOREIGN KEY ("weeklyTestId") REFERENCES public."weekly_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("questionId") REFERENCES public."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE public."attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weeklyTestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "score" INTEGER DEFAULT 0,
    "totalQuestions" INTEGER DEFAULT 0,
    "gemsEarned" INTEGER DEFAULT 0,
    FOREIGN KEY ("weeklyTestId") REFERENCES public."weekly_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("userId") REFERENCES public."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE public."attempt_answers" (
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "choice" TEXT,
    "isCorrect" BOOLEAN,
    "answeredAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("attemptId", "questionId"),
    FOREIGN KEY ("attemptId") REFERENCES public."attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("questionId") REFERENCES public."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Competitions
CREATE TABLE public."competitions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "registrationDeadline" TIMESTAMP(3),
    "maxParticipants" INTEGER,
    "entryFee" DECIMAL(65,30) DEFAULT 0,
    "prizePool" DECIMAL(65,30) DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "rules" TEXT,
    "eligibilityCriteria" TEXT,
    "grade" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public."competition_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'registered',
    FOREIGN KEY ("competitionId") REFERENCES public."competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("userId") REFERENCES public."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Notifications
CREATE TABLE public."notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES public."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Practice Attempts
CREATE TABLE public."practice_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "choice" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "gemsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES public."users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("questionId") REFERENCES public."math_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Payments
CREATE TABLE public."payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES public."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE public."payment_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "provider" TEXT NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "gemsAwarded" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES public."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create essential indexes
CREATE INDEX "users_email_idx" ON public."users"("email");
CREATE INDEX "wallets_userId_idx" ON public."wallets"("userId");
CREATE INDEX "questions_topicKey_idx" ON public."questions"("topicKey");
CREATE INDEX "math_questions_topicKey_idx" ON public."math_questions"("topicKey");
CREATE INDEX "attempts_userId_idx" ON public."attempts"("userId");
CREATE INDEX "notifications_userId_idx" ON public."notifications"("userId");
CREATE INDEX "practice_attempts_userId_idx" ON public."practice_attempts"("userId");

-- Verify all tables are in public schema
SELECT 'SUCCESS: All essential tables created in PUBLIC schema' as status;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
