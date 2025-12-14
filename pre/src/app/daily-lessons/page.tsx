"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, Play, Gem, BookOpen, ExternalLink, CheckCircle, Pause } from "lucide-react";
import { useRouter } from "next/navigation";

interface DailyLesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  requiredWatchDuration: number;
  scheduledDate: string;
  scheduledTime?: string;
  gemsReward: number;
  hasWatched: boolean;
  watchedAt?: string;
  gemsEarned: number;
  watchDuration?: number;
}

export default function DailyLessonsPage() {
  const [lessons, setLessons] = useState<DailyLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchingLesson, setWatchingLesson] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<DailyLesson | null>(null);
  const [watchProgress, setWatchProgress] = useState<{ [key: string]: number }>({});
  const [isWatching, setIsWatching] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [notificationShown, setNotificationShown] = useState<{ [key: string]: boolean }>({});
  const videoRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchLessons();
  }, []);

  // Update watch progress every second when video is actually playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isWatching && isVideoPlaying && currentLesson) {
      interval = setInterval(() => {
        setWatchProgress(prev => {
          const current = prev[currentLesson.id] || 0;
          const newProgress = Math.min(current + 1, currentLesson.duration);
          return { ...prev, [currentLesson.id]: newProgress };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWatching, isVideoPlaying, currentLesson]);

  // Fire a toast once when required watch duration is reached
  useEffect(() => {
    if (!isWatching || !currentLesson) return;
    const watched = watchProgress[currentLesson.id] || 0;
    const alreadyShown = notificationShown[currentLesson.id];
    if (watched >= currentLesson.requiredWatchDuration && !currentLesson.hasWatched && !alreadyShown) {
      setNotificationShown(prev => ({ ...prev, [currentLesson.id]: true }));
      toast({
        title: "🎉 Watch Complete!",
        description: "You can now practice and earn gems!",
        duration: 10000,
      });
    }
  }, [isWatching, currentLesson, watchProgress, notificationShown]);

  // YouTube iframe API event handlers
  useEffect(() => {
    if (!currentLesson) return;

    // Load YouTube iframe API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize YouTube player when API is ready
    (window as any).onYouTubeIframeAPIReady = () => {
      if (!videoRef.current) return;

      const player = new (window as any).YT.Player(videoRef.current, {
        events: {
          'onStateChange': (event: any) => {
            // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
            if (event.data === 1) {
              // Video is playing
              setIsVideoPlaying(true);
            } else if (event.data === 2 || event.data === 0) {
              // Video is paused or ended
              setIsVideoPlaying(false);
            }
          }
        }
      });
    };

    return () => {
      setIsVideoPlaying(false);
    };
  }, [currentLesson]);

  const fetchLessons = async () => {
    try {
      const response = await fetch("/api/daily-lessons");
      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch daily lessons");
      }
    } catch (error) {
      console.error("Error fetching daily lessons:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch daily lessons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartWatching = async (lesson: DailyLesson) => {
    setCurrentLesson(lesson);
    setWatchingLesson(lesson.id);
    setIsWatching(true);
    
    try {
      // Record that user started watching
      const response = await fetch(`/api/daily-lessons/${lesson.id}/start-watching`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast({
          title: "Video Started",
          description: `Watch for at least ${Math.floor(lesson.requiredWatchDuration / 60)} minutes to unlock practice!`,
        });
      }
    } catch (error) {
      console.error("Error starting video:", error);
      toast({
        title: "Error",
        description: "Failed to start video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStopWatching = () => {
    setIsWatching(false);
    setIsVideoPlaying(false);
    setWatchingLesson(null);
    setCurrentLesson(null);
  };

  const handleCompleteWatching = async (lesson: DailyLesson) => {
    const watchedTime = watchProgress[lesson.id] || 0;
    
    if (watchedTime < lesson.requiredWatchDuration) {
      toast({
        title: "Watch More",
        description: `You need to watch at least ${Math.floor(lesson.requiredWatchDuration / 60)} minutes to earn gems.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/daily-lessons/${lesson.id}/update-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          completed: true,
          watchDuration: watchedTime 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "🎉 Gems Earned!",
          description: `You earned ${data.gemsEarned} gems for watching this lesson!`,
          duration: 10000, // 10 seconds
        });
        handleStopWatching();
        fetchLessons(); // Refresh to update watch status
      } else {
        throw new Error("Failed to complete watching");
      }
    } catch (error) {
      console.error("Error completing video:", error);
      toast({
        title: "Error",
        description: "Failed to record completion. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePractice = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    const watchedTime = watchProgress[lessonId] || 0;
    if (watchedTime < lesson.requiredWatchDuration) {
      toast({
        title: "Watch More First",
        description: `You need to watch at least ${Math.floor(lesson.requiredWatchDuration / 60)} minutes to practice.`,
        variant: "destructive",
      });
      return;
    }

    router.push(`/daily-lessons/${lessonId}/questions`);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getYouTubeEmbedUrl = (url: string) => {
    // Convert YouTube URL to embed URL
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const canPractice = (lesson: DailyLesson) => {
    const watchedTime = watchProgress[lesson.id] || 0;
    return lesson.hasWatched || watchedTime >= lesson.requiredWatchDuration;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading daily lessons...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-12 px-4 lg:px-8 xl:px-0">
      <div className="max-w-7xl mx-auto xl:max-w-none xl:w-full xl:px-8 2xl:px-12">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 lg:mb-8">Daily Lessons</h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 px-4 max-w-3xl mx-auto leading-relaxed">
            Watch educational videos and practice with exercises to earn gems!
          </p>
        </div>

      {/* Video Player Modal */}
      {watchingLesson && currentLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-background rounded-lg w-full h-full max-w-none max-h-none overflow-hidden">
            <div className="p-2 sm:p-4 border-b flex justify-between items-center">
              <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold break-words">{currentLesson.title}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStopWatching}
                className="text-lg sm:text-xl lg:text-2xl p-2 sm:p-3"
              >
                ✕
              </Button>
            </div>
            
            <div className="p-2 sm:p-4 h-full flex flex-col">
              <div className="flex-1 relative bg-black rounded-lg overflow-hidden mb-2 sm:mb-4">
                <iframe
                  ref={videoRef}
                  src={getYouTubeEmbedUrl(currentLesson.videoUrl)}
                  title={currentLesson.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              
              <div className="space-y-2 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                  <div className="text-xs sm:text-sm lg:text-base text-muted-foreground break-words">
                    Watch Progress: {formatDuration(watchProgress[currentLesson.id] || 0)} / {formatDuration(currentLesson.duration)}
                  </div>
                  <div className="text-xs sm:text-sm lg:text-base text-muted-foreground break-words">
                    Required: {formatDuration(currentLesson.requiredWatchDuration)}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((watchProgress[currentLesson.id] || 0) / currentLesson.requiredWatchDuration * 100, 100)}%` 
                    }}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => handleCompleteWatching(currentLesson)}
                    disabled={!canPractice(currentLesson)}
                    className="flex-1 text-xs sm:text-sm lg:text-base py-2 sm:py-3 lg:py-4"
                    size="lg"
                  >
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                    <span className="break-words">Complete & Earn {currentLesson.gemsReward} Gems</span>
                  </Button>
                  
                  {canPractice(currentLesson) && (
                    <Button
                      onClick={() => handlePractice(currentLesson.id)}
                      variant="secondary"
                      className="text-xs sm:text-sm lg:text-base py-2 sm:py-3 lg:py-4"
                      size="lg"
                    >
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                      Practice
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {lessons.length === 0 ? (
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No lessons available today</p>
                <p className="text-muted-foreground">
                  Check back later for new daily lessons and earn gems by watching and practicing!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
              ) : (
          <div className="flex justify-center">
            <div className="grid gap-6 w-full max-w-screen-2xl mx-auto [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))] xl:[grid-template-columns:repeat(auto-fit,minmax(360px,1fr))]">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="relative hover:shadow-xl transition-all duration-300 hover:scale-105 h-full flex flex-col">
              {lesson.hasWatched && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              )}
              
              <CardHeader className="flex-grow">
                <div className="aspect-video relative mb-4">
                  {lesson.thumbnailUrl ? (
                    <img
                      src={lesson.thumbnailUrl}
                      alt={lesson.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                      <Play className="h-12 w-12 lg:h-16 lg:w-16 xl:h-20 xl:w-20 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <CardTitle className="text-lg lg:text-xl xl:text-2xl line-clamp-2 font-bold break-words">{lesson.title}</CardTitle>
                <CardDescription className="line-clamp-3 text-sm lg:text-base xl:text-lg break-words">
                  {lesson.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 flex-grow flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-sm lg:text-base xl:text-lg text-muted-foreground">
                  <div className="flex items-center gap-1 lg:gap-2 min-w-0">
                    <Calendar className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 flex-shrink-0" />
                    <span className="break-words">{formatDate(lesson.scheduledDate)}</span>
                  </div>
                  <div className="flex items-center gap-1 lg:gap-2 min-w-0">
                    <Clock className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 flex-shrink-0" />
                    <span className="break-words">{formatDuration(lesson.duration)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                  <div className="flex items-center gap-1 lg:gap-2 text-sm lg:text-base xl:text-lg min-w-0">
                    <Gem className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-yellow-500 flex-shrink-0" />
                    <span className="font-medium break-words">{lesson.gemsReward} gems</span>
                  </div>
                  
                  {lesson.hasWatched && lesson.gemsEarned > 0 && (
                    <div className="text-sm lg:text-base xl:text-lg text-green-600 font-medium break-words">
                      +{lesson.gemsEarned} earned
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  {!lesson.hasWatched ? (
                    <Button
                      onClick={() => handleStartWatching(lesson)}
                      disabled={watchingLesson === lesson.id}
                      className="flex-1 text-sm lg:text-base xl:text-lg py-2 lg:py-3 xl:py-4"
                      size="lg"
                    >
                      <Play className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 mr-2 flex-shrink-0" />
                      <span className="break-words">Watch Lesson</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePractice(lesson.id)}
                      variant="secondary"
                      className="flex-1 text-sm lg:text-base xl:text-lg py-2 lg:py-3 xl:py-4"
                      size="lg"
                    >
                      <BookOpen className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 mr-2 flex-shrink-0" />
                      <span className="break-words">Practice</span>
                    </Button>
                  )}
                </div>

                {lesson.hasWatched && (
                  <div className="text-xs lg:text-sm xl:text-base text-muted-foreground break-words">
                    Completed on {formatDate(lesson.watchedAt || '')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 