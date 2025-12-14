import { DailyLessonWithWatchStatus, DailyLessonStatus } from "@/types/daily-lesson";

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

export function calculateProgress(
  watchDuration: number | undefined,
  totalDuration: number
): number {
  if (!watchDuration) return 0;
  return Math.min(Math.round((watchDuration / totalDuration) * 100), 100);
}

export function getLessonStatus(lesson: DailyLessonWithWatchStatus): DailyLessonStatus {
  if (lesson.hasWatched) return 'completed';
  if (lesson.watchDuration && lesson.watchDuration > 0) return 'in-progress';
  return 'unwatched';
}

export function sortLessonsByDate(
  lessons: DailyLessonWithWatchStatus[]
): DailyLessonWithWatchStatus[] {
  return [...lessons].sort((a, b) => {
    const dateA = new Date(a.scheduledDate);
    const dateB = new Date(b.scheduledDate);
    return dateB.getTime() - dateA.getTime();
  });
}

export function filterLessonsByStatus(
  lessons: DailyLessonWithWatchStatus[],
  status: DailyLessonStatus
): DailyLessonWithWatchStatus[] {
  return lessons.filter(lesson => getLessonStatus(lesson) === status);
}

export function calculateDailyStreak(lessons: DailyLessonWithWatchStatus[]): number {
  let streak = 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const watchedDates = new Set(
    lessons
      .filter(l => l.hasWatched)
      .map(l => new Date(l.watchedAt || '').toDateString())
  );

  let currentDate = today;
  while (watchedDates.has(currentDate.toDateString())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

export function getNextUnwatchedLesson(
  lessons: DailyLessonWithWatchStatus[]
): DailyLessonWithWatchStatus | null {
  const sortedLessons = sortLessonsByDate(lessons);
  return sortedLessons.find(lesson => !lesson.hasWatched) || null;
}

export function calculateCompletionRate(
  watchedCount: number,
  totalCount: number
): number {
  if (totalCount === 0) return 0;
  return Math.round((watchedCount / totalCount) * 100);
}

export function isLessonAvailable(lesson: DailyLessonWithWatchStatus): boolean {
  const now = new Date();
  const scheduledDate = new Date(lesson.scheduledDate);
  
  if (lesson.scheduledTime) {
    const [hours, minutes] = lesson.scheduledTime.split(':').map(Number);
    scheduledDate.setHours(hours, minutes);
  }

  return now >= scheduledDate;
}

export function getTotalGemsEarned(lessons: DailyLessonWithWatchStatus[]): number {
  return lessons.reduce((total, lesson) => total + (lesson.gemsEarned || 0), 0);
}