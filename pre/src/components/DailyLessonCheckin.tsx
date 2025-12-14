"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, Play, Gem, CheckCircle, Eye, LogIn } from "lucide-react";

interface DailyLesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  scheduledDate: string;
  scheduledTime?: string;
  gemsReward: number;
  hasWatched: boolean;
  watchedAt?: string;
  gemsEarned: number;
}

interface DailyLessonsData {
  lessons: DailyLesson[];
  totalAvailable: number;
  totalWatched: number;
}

export default function DailyLessonCheckin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lessonsData, setLessonsData] = useState<DailyLessonsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchingLesson, setWatchingLesson] = useState<string | null>(null);
  const [userGems, setUserGems] = useState(0);

  useEffect(() => {
    if (status === "loading") {
      return; // Still loading session
    }
    
    if (status === "unauthenticated") {
      setLoading(false);
      return; // Not logged in
    }
    
    if (session?.user?.email) {
      fetchDailyLessons();
    }
  }, [session, status]);

  const fetchDailyLessons = async () => {
    try {
      console.log('🔄 Fetching daily lessons...');
      const response = await fetch("/api/daily-lessons");
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Daily lessons data received:', data);
        setLessonsData(data);
      } else {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        
        if (response.status === 401) {
          throw new Error("Please log in to access daily lessons");
        } else if (response.status === 403) {
          throw new Error("Access denied. Please check your permissions");
        } else {
          throw new Error(`Failed to fetch daily lessons (${response.status})`);
        }
      }
    } catch (error) {
      console.error("Error fetching daily lessons:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load daily lessons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWatchLesson = async (lessonId: string) => {
    setWatchingLesson(lessonId);
    
    try {
      const response = await fetch("/api/daily-lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "🎉 Lesson Completed!",
          description: `You earned ${data.gemsEarned} gems!`,
        });
        setUserGems(data.totalGems);
        fetchDailyLessons(); // Refresh the lessons data
        // Redirect to questions for this lesson (if any)
        router.push(`/daily-lessons/${lessonId}/questions`);
      } else {
        if (data.error === "You have already watched this lesson") {
          toast({
            title: "Already Watched",
            description: `You already earned ${data.gemsEarned} gems for this lesson`,
          });
        } else {
          throw new Error(data.error || "Failed to record lesson watch");
        }
      }
    } catch (error) {
      console.error("Error watching lesson:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to watch lesson",
        variant: "destructive",
      });
    } finally {
      setWatchingLesson(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (status === "loading") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading session...</div>
        </CardContent>
      </Card>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl lg:text-2xl">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
            Daily Lesson Check-in
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Watch daily lessons to earn gems and improve your skills
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 sm:py-12">
          <LogIn className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 sm:mb-6" />
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Please Log In</h3>
          <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
            You need to be logged in to access daily lessons
          </p>
          <Button 
            onClick={() => window.location.href = '/auth/login'}
            className="text-sm sm:text-base px-6 py-2"
          >
            Log In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!lessonsData || lessonsData.lessons.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl lg:text-2xl">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
            Daily Lesson Check-in
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Watch daily lessons to earn gems and improve your skills
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 sm:py-12">
          <div className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
            No lessons available for today
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Check back tomorrow for new lessons!
          </p>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = lessonsData.totalAvailable > 0 
    ? (lessonsData.totalWatched / lessonsData.totalAvailable) * 100 
    : 0;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl lg:text-2xl">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
              Daily Lesson Check-in
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">
              Watch daily lessons to earn gems and improve your skills
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 text-sm sm:text-base px-3 py-1">
            <Gem className="h-3 w-3 sm:h-4 sm:w-4" />
            {userGems.toFixed(3)} gems
          </Badge>
        </div>
        
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Progress: {lessonsData.totalWatched}/{lessonsData.totalAvailable} lessons</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 px-4 sm:px-6">
        {lessonsData.lessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`border rounded-lg p-3 sm:p-4 transition-all ${
              lesson.hasWatched 
                ? "bg-green-50 border-green-200" 
                : "bg-background border-border hover:border-primary/50"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              {lesson.thumbnailUrl && (
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <div className="w-full sm:w-24 h-16 bg-muted rounded-md overflow-hidden">
                    <img
                      src={lesson.thumbnailUrl}
                      alt={lesson.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">
                      {lesson.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {lesson.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-end gap-2 mt-2 sm:mt-0">
                    {lesson.hasWatched ? (
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm">
                        <CheckCircle className="h-3 w-3" />
                        Watched
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1 text-xs sm:text-sm">
                        <Gem className="h-3 w-3" />
                        {lesson.gemsReward} gems
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(lesson.duration)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(lesson.scheduledDate)}
                    {lesson.scheduledTime && ` at ${lesson.scheduledTime}`}
                  </div>
                  {lesson.hasWatched && lesson.watchedAt && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Watched {new Date(lesson.watchedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-3 justify-center sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(lesson.videoUrl, '_blank')}
                className="flex items-center justify-center gap-1 text-xs sm:text-sm w-full sm:w-auto"
              >
                <Play className="h-3 w-3" />
                Preview
              </Button>
              
              {!lesson.hasWatched && (
                <Button
                  size="sm"
                  onClick={() => handleWatchLesson(lesson.id)}
                  disabled={watchingLesson === lesson.id}
                  className="flex items-center justify-center gap-1 text-xs sm:text-sm w-full sm:w-auto"
                >
                  {watchingLesson === lesson.id ? (
                    "Recording..."
                  ) : (
                    <>
                      <Eye className="h-3 w-3" />
                      Watch & Earn
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {lessonsData.totalWatched === lessonsData.totalAvailable && lessonsData.totalAvailable > 0 && (
          <div className="text-center py-4 sm:py-6 bg-green-50 rounded-lg border border-green-200 mx-4 sm:mx-6">
            <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 mx-auto mb-2 sm:mb-3" />
            <p className="text-green-800 font-medium text-sm sm:text-base">All lessons completed for today!</p>
            <p className="text-green-600 text-xs sm:text-sm mt-1">Come back tomorrow for more lessons</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 