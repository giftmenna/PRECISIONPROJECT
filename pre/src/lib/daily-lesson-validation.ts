import { CreateDailyLessonInput } from "@/types/daily-lesson";

export class DailyLessonValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DailyLessonValidationError";
  }
}

export function validateDailyLessonInput(data: CreateDailyLessonInput): void {
  if (!data.title?.trim()) {
    throw new DailyLessonValidationError("Title is required");
  }

  if (!data.description?.trim()) {
    throw new DailyLessonValidationError("Description is required");
  }

  if (!data.videoUrl?.trim()) {
    throw new DailyLessonValidationError("Video URL is required");
  }

  if (!data.duration || data.duration < 0) {
    throw new DailyLessonValidationError("Invalid duration");
  }

  if (!data.scheduledDate) {
    throw new DailyLessonValidationError("Scheduled date is required");
  }

  if (data.gemsReward < 0) {
    throw new DailyLessonValidationError("Invalid gems reward amount");
  }

  // Validate video URL format
  try {
    new URL(data.videoUrl);
  } catch {
    throw new DailyLessonValidationError("Invalid video URL format");
  }

  // Validate scheduled date
    const scheduledDate = new Date(data.scheduledDate);
    if (isNaN(scheduledDate.getTime())) {
      throw new DailyLessonValidationError("Invalid scheduled date format");
    }

  // Validate scheduled time if provided
  if (data.scheduledTime) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.scheduledTime)) {
      throw new DailyLessonValidationError("Invalid scheduled time format (use HH:MM)");
    }
  }

  // Validate questions if provided
  if (data.questions?.length) {
    data.questions.forEach((q, index) => {
      if (!q.questionText?.trim()) {
        throw new DailyLessonValidationError(`Question ${index + 1}: Question text is required`);
      }

      if (!Array.isArray(q.options) || q.options.length < 2) {
        throw new DailyLessonValidationError(`Question ${index + 1}: At least 2 options are required`);
      }

      if (q.options.some(opt => !opt.trim())) {
        throw new DailyLessonValidationError(`Question ${index + 1}: Empty options are not allowed`);
      }

      if (q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
        throw new DailyLessonValidationError(`Question ${index + 1}: Invalid correct option index`);
      }
    });
  }
}

export function isValidYouTubeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      (parsedUrl.hostname === "youtube.com" ||
        parsedUrl.hostname === "www.youtube.com" ||
        parsedUrl.hostname === "youtu.be") &&
      (parsedUrl.searchParams.has("v") || parsedUrl.pathname.length > 1)
    );
  } catch {
    return false;
  }
}

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    let videoId = parsedUrl.searchParams.get("v");
    
    if (!videoId && parsedUrl.hostname === "youtu.be") {
      videoId = parsedUrl.pathname.slice(1);
    }

    return videoId || null;
  } catch {
    return null;
  }
}