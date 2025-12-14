-- Migration to add missing tables
-- Created: 2024-08-29

-- 1. Ad Watches
CREATE TABLE IF NOT EXISTS public.ad_watches (
  id text NOT NULL,
  userId text NOT NULL,
  gemsEarned integer NOT NULL DEFAULT 5,
  adType text NOT NULL DEFAULT 'VIDEO_AD'::text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ad_watches_pkey PRIMARY KEY (id),
  CONSTRAINT ad_watches_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id)
);

-- 2. AI Conversations
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  user_id text NOT NULL,
  title text NOT NULL DEFAULT 'New Conversation'::text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT ai_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 3. AI Messages
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  conversation_id text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_messages_pkey PRIMARY KEY (id),
  CONSTRAINT ai_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_conversations(id)
);

-- 4. Competition Drops
CREATE TABLE IF NOT EXISTS public.competition_drops (
  id text NOT NULL,
  competitionId text NOT NULL,
  opensAt timestamp without time zone NOT NULL,
  closesAt timestamp without time zone NOT NULL,
  indexInCompetition integer NOT NULL,
  CONSTRAINT competition_drops_pkey PRIMARY KEY (id),
  CONSTRAINT competition_drops_competitionId_fkey FOREIGN KEY (competitionId) REFERENCES public.competitions(id)
);

-- 5. Drop Attempts
CREATE TABLE IF NOT EXISTS public.drop_attempts (
  id text NOT NULL,
  dropId text NOT NULL,
  userId text NOT NULL,
  startedAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submittedAt timestamp without time zone,
  score integer NOT NULL DEFAULT 0,
  avgTimeMs integer NOT NULL DEFAULT 0,
  CONSTRAINT drop_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT drop_attempts_dropId_fkey FOREIGN KEY (dropId) REFERENCES public.competition_drops(id),
  CONSTRAINT drop_attempts_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id)
);

-- 6. Drop Answers
CREATE TABLE IF NOT EXISTS public.drop_answers (
  attemptId text NOT NULL,
  questionId text NOT NULL,
  choice text,
  isCorrect boolean NOT NULL DEFAULT false,
  timeMs integer NOT NULL,
  position integer NOT NULL,
  CONSTRAINT drop_answers_pkey PRIMARY KEY (attemptId, questionId),
  CONSTRAINT drop_answers_attemptId_fkey FOREIGN KEY (attemptId) REFERENCES public.drop_attempts(id),
  CONSTRAINT drop_answers_questionId_fkey FOREIGN KEY (questionId) REFERENCES public.math_questions(id)
);

-- 7. Drop Questions
CREATE TABLE IF NOT EXISTS public.drop_questions (
  dropId text NOT NULL,
  questionId text NOT NULL,
  position integer NOT NULL,
  CONSTRAINT drop_questions_pkey PRIMARY KEY (dropId, questionId),
  CONSTRAINT drop_questions_dropId_fkey FOREIGN KEY (dropId) REFERENCES public.competition_drops(id),
  CONSTRAINT drop_questions_questionId_fkey FOREIGN KEY (questionId) REFERENCES public.math_questions(id)
);

-- 8. Daily Lessons
CREATE TABLE IF NOT EXISTS public.daily_lessons (
  id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  videoUrl text NOT NULL,
  thumbnailUrl text,
  duration integer NOT NULL,
  scheduledDate timestamp without time zone NOT NULL,
  isActive boolean NOT NULL DEFAULT true,
  autoStack boolean NOT NULL DEFAULT false,
  gemsReward double precision NOT NULL DEFAULT 0.25,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  scheduledTime text,
  requiredWatchDuration integer NOT NULL DEFAULT 120,
  CONSTRAINT daily_lessons_pkey PRIMARY KEY (id)
);

-- 9. Daily Lesson Questions
CREATE TABLE IF NOT EXISTS public.daily_lesson_questions (
  dailyLessonId text NOT NULL,
  questionId text NOT NULL,
  position integer NOT NULL,
  CONSTRAINT daily_lesson_questions_pkey PRIMARY KEY (dailyLessonId, questionId),
  CONSTRAINT daily_lesson_questions_dailylessonid_fkey FOREIGN KEY (dailyLessonId) REFERENCES public.daily_lessons(id),
  CONSTRAINT daily_lesson_questions_questionid_fkey FOREIGN KEY (questionId) REFERENCES public.math_questions(id)
);

-- 10. Daily Lesson Watches
CREATE TABLE IF NOT EXISTS public.daily_lesson_watches (
  id text NOT NULL,
  userId text NOT NULL,
  dailyLessonId text NOT NULL,
  watchedAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  gemsEarned double precision NOT NULL DEFAULT 0.25,
  CONSTRAINT daily_lesson_watches_pkey PRIMARY KEY (id),
  CONSTRAINT daily_lesson_watches_dailyLessonId_fkey FOREIGN KEY (dailyLessonId) REFERENCES public.daily_lessons(id),
  CONSTRAINT daily_lesson_watches_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id)
);

-- 11. Notification Settings
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id text NOT NULL,
  userId text NOT NULL,
  pushEnabled boolean NOT NULL DEFAULT true,
  emailEnabled boolean NOT NULL DEFAULT true,
  newQuestionsEnabled boolean NOT NULL DEFAULT true,
  competitionEnabled boolean NOT NULL DEFAULT true,
  practiceEnabled boolean NOT NULL DEFAULT true,
  reminderEnabled boolean NOT NULL DEFAULT true,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  welcomeMessagesEnabled boolean NOT NULL DEFAULT true,
  CONSTRAINT notification_settings_pkey PRIMARY KEY (id),
  CONSTRAINT notification_settings_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id)
);

-- 12. Push Subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id text NOT NULL,
  userId text NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT push_subscriptions_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ad_watches_user_id ON public.ad_watches(userId);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_drop_attempts_user_id ON public.drop_attempts(userId);
CREATE INDEX IF NOT EXISTS idx_drop_attempts_drop_id ON public.drop_attempts(dropId);
CREATE INDEX IF NOT EXISTS idx_daily_lesson_watches_user_id ON public.daily_lesson_watches(userId);
CREATE INDEX IF NOT EXISTS idx_daily_lesson_watches_lesson_id ON public.daily_lesson_watches(dailyLessonId);
