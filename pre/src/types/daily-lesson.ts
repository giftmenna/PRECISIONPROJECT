// Consolidated and cleaned types for daily lessons

export interface DailyLessonQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  order: number;
  lessonId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DailyLesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  requiredWatchDuration: number;
  scheduledDate: string;
  scheduledTime?: string;
  isActive: boolean;
  autoStack: boolean;
  gemsReward: number;
  updatedAt: Date;
  _count?: {
    watchedBy: number;
    questions?: number;
  };
  questions?: DailyLessonQuestion[];
}

export interface DailyLessonWatch {
  id?: string;
  userId: string;
  dailyLessonId: string;
  watchDuration?: number;
  completed?: boolean;
  gemsEarned: number;
  watchedAt: Date | string | null;
  lastPosition?: number; // Store video position for resuming
  updatedAt?: Date;
}

export interface DailyLessonWithWatchStatus extends DailyLesson {
  hasWatched: boolean;
  watchedAt?: Date | string | null;
  gemsEarned?: number;
  watchDuration?: number;
  lastPosition?: number;
  progress?: number; // Percentage of video watched
}

export interface CreateDailyLessonInput {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  requiredWatchDuration: number;
  scheduledDate: string;
  scheduledTime?: string;
  isActive: boolean;
  autoStack: boolean;
  gemsReward: number;
  questions?: Array<{
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
  }>;
}

export interface DailyLessonProgress {
  totalLessons: number;
  watchedLessons: number;
  totalGemsEarned: number;
  completionRate: number;
  streak: number;
  lastWatchedAt?: Date;
}

export interface DailyLessonQuestionResponse {
  questionId: string;
  lessonId: string;
  userId: string;
  selectedOption: number;
  isCorrect: boolean;
  responseTime: number;
  createdAt: Date;
}

export type DailyLessonStatus = 'unwatched' | 'in-progress' | 'completed';
