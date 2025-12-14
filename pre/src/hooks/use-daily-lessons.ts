"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { DailyLessonWithWatchStatus, DailyLessonStatus } from "@/types/daily-lesson";
import {
  sortLessonsByDate,
  filterLessonsByStatus,
  calculateDailyStreak,
  getNextUnwatchedLesson,
  calculateCompletionRate,
  getTotalGemsEarned
} from "@/lib/daily-lesson-utils";

interface UseDailyLessonsOptions {
  autoRefetch?: boolean;
  refetchInterval?: number;
}

interface UseDailyLessonsReturn {
  lessons: DailyLessonWithWatchStatus[];
  loading: boolean;
  error: Error | null;
  streak: number;
  completionRate: number;
  totalGemsEarned: number;
  filterByStatus: (status: DailyLessonStatus) => DailyLessonWithWatchStatus[];
  startWatching: (lessonId: string) => Promise<void>;
  pauseWatching: (lessonId: string, currentTime: number) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useDailyLessons(
  options: UseDailyLessonsOptions = {}
): UseDailyLessonsReturn {
  const { autoRefetch = true, refetchInterval = 60000 } = options;
  const { data: session } = useSession();
  const router = useRouter();

  const [lessons, setLessons] = useState<DailyLessonWithWatchStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLessons = useCallback(async () => {
    try {
      const response = await fetch("/api/daily-lessons");
      
      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }
      
      if (!response.ok) {
        // If no lessons are found, the API might return a 404. This is not an error condition for the user.
        if (response.status === 404) {
          setLessons([]);
          setError(null);
          return;
        }

        let errorMessage = "Failed to fetch daily lessons";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const sortedLessons = sortLessonsByDate(data.lessons || []);
      setLessons(sortedLessons);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch lessons"));
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch lessons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [router]);

  const startWatching = async (lessonId: string) => {
    try {
      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson) throw new Error("Lesson not found");

      const response = await fetch(`/api/daily-lessons/${lessonId}/start-watching`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to start watching");
      }

      toast({
        title: "Video Started",
        description: `Watch for at least ${Math.floor(lesson.requiredWatchDuration / 60)} minutes to unlock practice!`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to start watching",
        variant: "destructive",
      });
    }
  };

  const pauseWatching = async (lessonId: string, currentTime: number) => {
    try {
      const response = await fetch(`/api/daily-lessons/${lessonId}/update-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchDuration: currentTime }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update progress");
      }

      await fetchLessons(); // Refresh lessons to get updated progress
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const completeLesson = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/daily-lessons/${lessonId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to complete lesson");
      }

      const data = await response.json();
      toast({
        title: "🎉 Lesson Completed!",
        description: `You earned ${data.gemsEarned} gems!`,
      });

      await fetchLessons(); // Refresh lessons to get updated status
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to complete lesson",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchLessons();
    }
  }, [session, fetchLessons]);

  // Auto-refresh lessons
  useEffect(() => {
    if (!autoRefetch || !session?.user?.email) return;

    const interval = setInterval(fetchLessons, refetchInterval);
    return () => clearInterval(interval);
  }, [autoRefetch, refetchInterval, session, fetchLessons]);

  const streak = useMemo(() => calculateDailyStreak(lessons), [lessons]);
  const completionRate = useMemo(() => calculateCompletionRate(
    lessons.filter(l => l.hasWatched).length,
    lessons.length
  ), [lessons]);
  const totalGemsEarned = useMemo(() => getTotalGemsEarned(lessons), [lessons]);

  return {
    lessons,
    loading,
    error,
    streak,
    completionRate,
    totalGemsEarned,
    filterByStatus: (status) => filterLessonsByStatus(lessons, status),
    startWatching,
    pauseWatching,
    completeLesson,
    refetch: fetchLessons,
  };
}