-- CreateEnum
CREATE TYPE "ImageReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('PRACTICE_REWARD', 'COMPETITION_REWARD', 'ENTRY_FEE_GEM', 'ADMIN_ADJUSTMENT', 'REFUND');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "EntryMethod" AS ENUM ('FREE', 'FIAT', 'GEM');

-- CreateEnum
CREATE TYPE "CompetitionStatus" AS ENUM ('DRAFT', 'COMING_SOON', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GradeCompetitionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_QUESTION', 'COMPETITION_STARTING', 'PRACTICE_REMINDER', 'COMPETITION_RESULT', 'GEM_EARNED', 'SYSTEM_UPDATE', 'WELCOME_FIRST_TIME', 'WELCOME_BACK', 'NEW_QUESTIONS_POSTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT,
    "grade" TEXT,
    "ipAddress" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "lastLoginAt" TIMESTAMP(3),
    "age" INTEGER,
    "country" TEXT,
    "gender" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gemsBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_ledger" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" "LedgerType" NOT NULL,
    "refType" TEXT,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amountNgn" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "ref" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "gemAmount" INTEGER NOT NULL,
    "packageName" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL DEFAULT 'PAYSTACK',
    "reference" TEXT NOT NULL,
    "paystackReference" TEXT,
    "authorizationUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gem_rates" (
    "id" TEXT NOT NULL,
    "rateGemPerNgn" DECIMAL(65,30) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gem_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "math_questions" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "correctChoice" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "topicKey" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "explanation" TEXT,
    "timeLimit" INTEGER NOT NULL DEFAULT 60,
    "gems" INTEGER NOT NULL DEFAULT 0,
    "requiredGems" INTEGER DEFAULT 0,
    "grade" TEXT,
    "imageUrl" TEXT,
    "competitionId" TEXT,
    "position" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT DEFAULT 'DAILY_LESSON',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "math_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_competitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "grade" TEXT NOT NULL,
    "entryFee" DECIMAL(65,30) NOT NULL DEFAULT 3,
    "status" "GradeCompetitionStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "timeLimit" INTEGER NOT NULL DEFAULT 1800,
    "requireImageUpload" BOOLEAN NOT NULL DEFAULT false,
    "showExplanations" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "grade_competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_competition_questions" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "correct" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT,
    "imageUrl" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeLimit" INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT "grade_competition_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_competition_entries" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "EntryStatus" NOT NULL DEFAULT 'PENDING',
    "method" "EntryMethod" NOT NULL,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_competition_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_competition_results" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "accuracy" DECIMAL(65,30) NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "gemsEarned" DECIMAL(65,30) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_competition_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_competition_image_uploads" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewStatus" "ImageReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "isCorrect" BOOLEAN,

    CONSTRAINT "grade_competition_image_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "choice" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "gemsEarned" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practice_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "dropIntervalHours" INTEGER NOT NULL,
    "dropOpenMinutes" INTEGER NOT NULL,
    "questionsPerDrop" INTEGER NOT NULL DEFAULT 1,
    "entryType" "EntryType" NOT NULL,
    "entryPriceNgn" INTEGER,
    "entryPriceGem" DECIMAL(65,30),
    "prizeCashNgn" INTEGER NOT NULL DEFAULT 0,
    "prizeSchema" JSONB NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CompetitionStatus" NOT NULL DEFAULT 'DRAFT',
    "timeLimit" INTEGER NOT NULL DEFAULT 1800,
    "totalQuestions" INTEGER NOT NULL DEFAULT 10,
    "requireImageUpload" BOOLEAN NOT NULL DEFAULT false,
    "showExplanations" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_entries" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "EntryStatus" NOT NULL DEFAULT 'PENDING',
    "method" "EntryMethod" NOT NULL,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competition_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_image_uploads" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewStatus" "ImageReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "isCorrect" BOOLEAN,

    CONSTRAINT "competition_image_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_drops" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "opensAt" TIMESTAMP(3) NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "indexInCompetition" INTEGER NOT NULL,

    CONSTRAINT "competition_drops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drop_questions" (
    "dropId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "drop_questions_pkey" PRIMARY KEY ("dropId","questionId")
);

-- CreateTable
CREATE TABLE "drop_attempts" (
    "id" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "score" INTEGER NOT NULL DEFAULT 0,
    "avgTimeMs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "drop_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drop_answers" (
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "choice" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "timeMs" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "drop_answers_pkey" PRIMARY KEY ("attemptId","questionId")
);

-- CreateTable
CREATE TABLE "competition_leaderboards" (
    "competitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gemsEarned" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "correctTotal" INTEGER NOT NULL DEFAULT 0,
    "avgTimeMs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "competition_leaderboards_pkey" PRIMARY KEY ("competitionId","userId")
);

-- CreateTable
CREATE TABLE "topics" (
    "key" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "defaultGems" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "correct" TEXT NOT NULL,
    "source" TEXT,
    "difficulty" TEXT,
    "uidExternal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gemValue" INTEGER NOT NULL DEFAULT 2,
    "topicKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_tests" (
    "id" TEXT NOT NULL,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "liveAt" TIMESTAMP(3) NOT NULL,
    "closeAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeLimit" INTEGER NOT NULL DEFAULT 0,
    "gemsReward" DECIMAL(65,30),
    "rewardRule" TEXT NOT NULL DEFAULT 'ALL_CORRECT',
    "maxWrongAllowed" INTEGER NOT NULL DEFAULT 0,
    "revealResultAtEnd" BOOLEAN NOT NULL DEFAULT true,
    "requiredGrade" TEXT,

    CONSTRAINT "weekly_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_test_questions" (
    "weeklyTestId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "weekly_test_questions_pkey" PRIMARY KEY ("weeklyTestId","questionId")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" TEXT NOT NULL,
    "weeklyTestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "score" INTEGER NOT NULL DEFAULT 0,
    "avgTimeMs" INTEGER NOT NULL DEFAULT 0,
    "gemsTotal" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt_answers" (
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "choice" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "timeMs" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "gemValue" INTEGER NOT NULL,

    CONSTRAINT "attempt_answers_pkey" PRIMARY KEY ("attemptId","questionId")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "newQuestionsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "competitionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "practiceEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "welcomeMessagesEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_watches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gemsEarned" INTEGER NOT NULL DEFAULT 5,
    "adType" TEXT NOT NULL DEFAULT 'VIDEO_AD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_watches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_sets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredGems" INTEGER NOT NULL DEFAULT 0,
    "requiredGrade" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "timeLimit" INTEGER NOT NULL DEFAULT 0,
    "gemsReward" DECIMAL(65,30),
    "rewardRule" TEXT NOT NULL DEFAULT 'ALL_CORRECT',
    "maxWrongAllowed" INTEGER NOT NULL DEFAULT 0,
    "revealResultAtEnd" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "test_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testSetId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL DEFAULT '',
    "thumbnailUrl" TEXT,
    "duration" INTEGER NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoStack" BOOLEAN NOT NULL DEFAULT false,
    "gemsReward" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledTime" TEXT,
    "requiredWatchDuration" INTEGER NOT NULL DEFAULT 120,

    CONSTRAINT "daily_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_lesson_watches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyLessonId" TEXT NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gemsEarned" DOUBLE PRECISION NOT NULL DEFAULT 0.25,

    CONSTRAINT "daily_lesson_watches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_modules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "topic" TEXT NOT NULL,
    "notes" TEXT,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "gemsReward" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_questions" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "correct" TEXT NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "gemsEarned" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "learning_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_question_attempts" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userAnswer" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_question_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Conversation',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_chats" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Study Group',
    "description" TEXT,
    "avatar" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "group_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_chat_members" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN DEFAULT true,
    "is_banned" BOOLEAN DEFAULT false,
    "banned_by" TEXT,
    "banned_at" TIMESTAMP(3),
    "ban_reason" TEXT,

    CONSTRAINT "group_chat_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_chat_messages" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "media_url" TEXT,
    "media_duration" INTEGER,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_lesson_questions" (
    "dailyLessonId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'multiple_choice',

    CONSTRAINT "daily_lesson_questions_pkey" PRIMARY KEY ("dailyLessonId","questionId")
);

-- CreateTable
CREATE TABLE "_TestSetQuestions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TestSetQuestions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "otp_codes_email_key" ON "otp_codes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_reference_key" ON "payment_transactions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "grade_competition_entries_competitionId_userId_key" ON "grade_competition_entries"("competitionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "grade_competition_results_competitionId_userId_key" ON "grade_competition_results"("competitionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "practice_attempts_userId_questionId_key" ON "practice_attempts"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "competition_entries_competitionId_userId_key" ON "competition_entries"("competitionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "drop_attempts_dropId_userId_key" ON "drop_attempts"("dropId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "questions_uidExternal_key" ON "questions"("uidExternal");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_tests_weekOf_key" ON "weekly_tests"("weekOf");

-- CreateIndex
CREATE UNIQUE INDEX "attempts_weeklyTestId_userId_key" ON "attempts"("weeklyTestId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "notification_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_userId_endpoint_key" ON "push_subscriptions"("userId", "endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "daily_lesson_watches_userId_dailyLessonId_key" ON "daily_lesson_watches"("userId", "dailyLessonId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_attempts_userId_moduleId_key" ON "learning_attempts"("userId", "moduleId");

-- CreateIndex
CREATE INDEX "ai_conversations_user_id_idx" ON "ai_conversations"("user_id");

-- CreateIndex
CREATE INDEX "ai_messages_conversation_id_idx" ON "ai_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "ai_messages_created_at_idx" ON "ai_messages"("created_at");

-- CreateIndex
CREATE INDEX "group_chat_members_chat_id_idx" ON "group_chat_members"("chat_id");

-- CreateIndex
CREATE INDEX "group_chat_members_user_id_idx" ON "group_chat_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_chat_members_chat_id_user_id_key" ON "group_chat_members"("chat_id", "user_id");

-- CreateIndex
CREATE INDEX "group_chat_messages_chat_id_idx" ON "group_chat_messages"("chat_id");

-- CreateIndex
CREATE INDEX "group_chat_messages_created_at_idx" ON "group_chat_messages"("created_at");

-- CreateIndex
CREATE INDEX "group_chat_messages_user_id_idx" ON "group_chat_messages"("user_id");

-- CreateIndex
CREATE INDEX "_TestSetQuestions_B_index" ON "_TestSetQuestions"("B");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_ledger" ADD CONSTRAINT "wallet_ledger_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "math_questions" ADD CONSTRAINT "math_questions_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_competition_questions" ADD CONSTRAINT "grade_competition_questions_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "grade_competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_competition_entries" ADD CONSTRAINT "grade_competition_entries_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "grade_competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_competition_entries" ADD CONSTRAINT "grade_competition_entries_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_competition_entries" ADD CONSTRAINT "grade_competition_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_competition_results" ADD CONSTRAINT "grade_competition_results_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "grade_competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_competition_results" ADD CONSTRAINT "grade_competition_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_competition_image_uploads" ADD CONSTRAINT "grade_competition_image_uploads_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "grade_competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_competition_image_uploads" ADD CONSTRAINT "grade_competition_image_uploads_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "grade_competition_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_competition_image_uploads" ADD CONSTRAINT "grade_competition_image_uploads_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_competition_image_uploads" ADD CONSTRAINT "grade_competition_image_uploads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "math_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_entries" ADD CONSTRAINT "competition_entries_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_entries" ADD CONSTRAINT "competition_entries_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_entries" ADD CONSTRAINT "competition_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_image_uploads" ADD CONSTRAINT "competition_image_uploads_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_image_uploads" ADD CONSTRAINT "competition_image_uploads_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "math_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_image_uploads" ADD CONSTRAINT "competition_image_uploads_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_image_uploads" ADD CONSTRAINT "competition_image_uploads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_drops" ADD CONSTRAINT "competition_drops_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drop_questions" ADD CONSTRAINT "drop_questions_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "competition_drops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drop_questions" ADD CONSTRAINT "drop_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "math_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drop_attempts" ADD CONSTRAINT "drop_attempts_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "competition_drops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drop_attempts" ADD CONSTRAINT "drop_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drop_answers" ADD CONSTRAINT "drop_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "drop_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drop_answers" ADD CONSTRAINT "drop_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "math_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_leaderboards" ADD CONSTRAINT "competition_leaderboards_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_leaderboards" ADD CONSTRAINT "competition_leaderboards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_topicKey_fkey" FOREIGN KEY ("topicKey") REFERENCES "topics"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_test_questions" ADD CONSTRAINT "weekly_test_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_test_questions" ADD CONSTRAINT "weekly_test_questions_weeklyTestId_fkey" FOREIGN KEY ("weeklyTestId") REFERENCES "weekly_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_weeklyTestId_fkey" FOREIGN KEY ("weeklyTestId") REFERENCES "weekly_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_watches" ADD CONSTRAINT "ad_watches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_testSetId_fkey" FOREIGN KEY ("testSetId") REFERENCES "test_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_lesson_watches" ADD CONSTRAINT "daily_lesson_watches_dailyLessonId_fkey" FOREIGN KEY ("dailyLessonId") REFERENCES "daily_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_lesson_watches" ADD CONSTRAINT "daily_lesson_watches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_questions" ADD CONSTRAINT "learning_questions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "learning_modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_attempts" ADD CONSTRAINT "learning_attempts_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "learning_modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_attempts" ADD CONSTRAINT "learning_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_question_attempts" ADD CONSTRAINT "learning_question_attempts_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "learning_attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_question_attempts" ADD CONSTRAINT "learning_question_attempts_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "learning_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_chat_members" ADD CONSTRAINT "group_chat_members_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "group_chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_chat_members" ADD CONSTRAINT "group_chat_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_chat_messages" ADD CONSTRAINT "group_chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "group_chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_chat_messages" ADD CONSTRAINT "group_chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daily_lesson_questions" ADD CONSTRAINT "daily_lesson_questions_dailyLessonId_fkey" FOREIGN KEY ("dailyLessonId") REFERENCES "daily_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_lesson_questions" ADD CONSTRAINT "daily_lesson_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "math_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TestSetQuestions" ADD CONSTRAINT "_TestSetQuestions_A_fkey" FOREIGN KEY ("A") REFERENCES "math_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TestSetQuestions" ADD CONSTRAINT "_TestSetQuestions_B_fkey" FOREIGN KEY ("B") REFERENCES "test_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
