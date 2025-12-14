"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Play, Gem, CheckCircle, Pause } from "lucide-react";
import { DailyLessonWithWatchStatus, DailyLessonStatus } from "@/types/daily-lesson";

interface DailyLessonCardProps {
  lesson: DailyLessonWithWatchStatus;
  onWatch: (lessonId: string) => void;
  onComplete: (lessonId: string) => void;
  onPause: (lessonId: string, currentTime: number) => void;
  className?: string;
}

export function DailyLessonCard({ 
  lesson, 
  onWatch, 
  onComplete, 
  onPause,
  className = "" 
}: DailyLessonCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const getLessonStatus = (): DailyLessonStatus => {
    if (lesson.hasWatched) return 'completed';
    if (lesson.watchDuration && lesson.watchDuration > 0) return 'in-progress';
    return 'unwatched';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      onPause(lesson.id, lesson.watchDuration || 0);
    } else {
      setIsPlaying(true);
      onWatch(lesson.id);
    }
  };

  const watchProgress = lesson.watchDuration
    ? Math.min(Math.round((lesson.watchDuration / lesson.duration) * 100), 100)
    : 0;

  const canComplete = lesson.watchDuration
    ? lesson.watchDuration >= lesson.requiredWatchDuration
    : false;

  const status = getLessonStatus();

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div 
        className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300"
        style={{ width: `${watchProgress}%` }}
      />
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{lesson.title}</CardTitle>
            <CardDescription>{lesson.description}</CardDescription>
          </div>
          <Badge variant={status === 'completed' ? "default" : "secondary"}>
            {status === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {lesson.thumbnailUrl && (
          <div className="aspect-video bg-muted rounded-md overflow-hidden">
            <img
              src={lesson.thumbnailUrl}
              alt={lesson.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDuration(lesson.duration)}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(lesson.scheduledDate)}
          </div>
          <div className="flex items-center gap-1">
            <Gem className="h-4 w-4" />
            {lesson.gemsReward} gems
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handlePlayPause}
            className="flex-1"
            variant={isPlaying ? "destructive" : "default"}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {status === 'in-progress' ? 'Resume' : 'Start'} Watching
              </>
            )}
          </Button>
          {canComplete && !lesson.hasWatched && (
            <Button onClick={() => onComplete(lesson.id)} variant="outline">
              Complete & Earn Gems
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}