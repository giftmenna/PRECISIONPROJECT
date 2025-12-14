"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, Gem, Target, TrendingUp, Award, Clock, Users, TrendingDown, User, MessageCircle, Play, CheckCircle, Calendar } from "lucide-react";
import { TOPICS } from "@/lib/topics";
import AdGemEarning from "@/components/AdGemEarning";
import { toast } from "@/hooks/use-toast";

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [groupChatData, setGroupChatData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Daily Lessons State
  const [lessons, setLessons] = useState<DailyLesson[]>([]);
  const [watchingLesson, setWatchingLesson] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<DailyLesson | null>(null);
  const [watchProgress, setWatchProgress] = useState<{ [key: string]: number }>({});
  const [isWatching, setIsWatching] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [notificationShown, setNotificationShown] = useState<{ [key: string]: boolean }>({});
  const videoRef = useRef<HTMLIFrameElement>(null);

  // Handle redirect when not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  // Check if user is admin and redirect
  const isAdmin = session && ((session.user as any).role === "admin" || (session.user as any).role === "ADMIN");
  
  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [isAdmin, router]);

  useEffect(() => {
    if (session?.user?.email && !isAdmin) {
      fetchDashboardData();
      fetchGroupChatData();
      fetchLessons();
    }
  }, [session, isAdmin]);

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

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupChatData = async () => {
    try {
      const response = await fetch('/api/group-chat/active-users');
      if (response.ok) {
        const data = await response.json();
        setGroupChatData(data);
      }
    } catch (error) {
      console.error('Error fetching group chat data:', error);
    }
  };

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
          duration: 5000,
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
        fetchDashboardData(); // Refresh dashboard data
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (!session) {
    return null;
  }

  // If admin, show loading while redirecting
  if (isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {session.user?.name || "User"}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to continue your mathematical journey?
          </p>
        </div>

        {/* Stats Cards - 2x3 Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-8">
          {/* Total Practice - Top Left */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700 dark:text-sky-300">Total Practice</CardTitle>
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{dashboardData?.stats?.totalPractice || 0}</div>
              <div className="flex items-center gap-1 text-xs text-sky-600/70 dark:text-sky-400/70">
                {dashboardData?.stats?.practiceChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                {Math.abs(dashboardData?.stats?.practiceChange || 0)}% from last week
              </div>
            </CardContent>
          </Card>

          {/* Current Gems - Top Right */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Current Gems</CardTitle>
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Gem className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{dashboardData?.wallet?.gemsBalance || 0}</div>
              <div className="flex items-center gap-1 text-xs text-orange-600/70 dark:text-orange-400/70">
                {dashboardData?.stats?.gemsChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                {Math.abs(dashboardData?.stats?.gemsChange || 0)} gems earned this week
              </div>
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/pricing')}
                  className="w-full"
                >
                  <Gem className="h-4 w-4 mr-2" />
                  Buy Gems
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Average Score - Bottom Left */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Average Score</CardTitle>
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{dashboardData?.stats?.averageScore || 0}%</div>
              <div className="flex items-center gap-1 text-xs text-green-600/70 dark:text-green-400/70">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {dashboardData?.stats?.scoreChange || 0}% improvement
              </div>
            </CardContent>
          </Card>

          {/* Rank - Bottom Left */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Rank</CardTitle>
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Trophy className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">#{dashboardData?.stats?.rank || 0}</div>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Top {dashboardData?.stats?.topPercentage || 0}%</p>
            </CardContent>
          </Card>

          {/* Total Gems Earned - Bottom Center */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Total Earned</CardTitle>
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Award className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{dashboardData?.stats?.totalGems || 0}</div>
              <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">All time gems earned</p>
            </CardContent>
          </Card>

          {/* Community Discussion - Active Students */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => router.push("/group-chat")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Community Discussion</CardTitle>
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{groupChatData?.activeUsers || 0}</div>
              <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">students online</p>
            </CardContent>
          </Card>
        </div>

        {/* Ad Gem Earning */}
        <div className="mb-8">
          <AdGemEarning onGemsEarned={(gems) => {
            // Update total gems if needed
            if (dashboardData?.stats) {
              setDashboardData({
                ...dashboardData,
                stats: {
                  ...dashboardData.stats,
                  totalGems: (dashboardData.stats.totalGems || 0) + gems
                }
              });
            }
          }} />
        </div>

        {/* Daily Lesson Check-in */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Daily Lessons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No daily lessons scheduled for today. Check back later!</p>
              </div>
            ) : (
              lessons.map((lesson) => (
                <Card key={lesson.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{lesson.title}</CardTitle>
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{lesson.description}</p>
                    <p className="text-sm text-gray-500">
                      Scheduled: {formatDate(lesson.scheduledDate)} {lesson.scheduledTime ? `at ${lesson.scheduledTime}` : ''}
                    </p>
                    <p className="text-sm text-gray-500">
                      Duration: {formatDuration(lesson.duration)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Required Watch Duration: {formatDuration(lesson.requiredWatchDuration)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Gems Reward: {lesson.gemsReward}
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row items-stretch gap-2">
                      {isWatching && watchingLesson === lesson.id ? (
                        <Button variant="outline" onClick={handleStopWatching} className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Stop Watching
                        </Button>
                      ) : (
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleStartWatching(lesson)} >
                          <Play className="h-4 w-4 mr-2" />
                          Start Watching
                        </Button>
                      )}
                      {canPractice(lesson) && (
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => handlePractice(lesson.id)} >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Practice
                        </Button>
                      )}
                      {!canPractice(lesson) && (
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => handleCompleteWatching(lesson)} >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Watching
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Video Player Modal */}
        {watchingLesson && currentLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">{currentLesson.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStopWatching}
                >
                  ✕
                </Button>
              </div>
              
              <div className="p-4">
                <div className="aspect-video relative bg-black rounded-lg overflow-hidden mb-4">
                  <iframe
                    ref={videoRef}
                    src={getYouTubeEmbedUrl(currentLesson.videoUrl)}
                    title={currentLesson.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Watch Progress: {formatDuration(watchProgress[currentLesson.id] || 0)} / {formatDuration(currentLesson.duration)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Required: {formatDuration(currentLesson.requiredWatchDuration)}
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((watchProgress[currentLesson.id] || 0) / currentLesson.requiredWatchDuration * 100, 100)}%` 
                      }}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCompleteWatching(currentLesson)}
                      disabled={!canPractice(currentLesson)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete & Earn {currentLesson.gemsReward} Gems
                    </Button>
                    
                    {canPractice(currentLesson) && (
                      <Button
                        onClick={() => handlePractice(currentLesson.id)}
                        variant="secondary"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Practice
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Practice Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Practice with our comprehensive question bank across all topics.
              </p>
              <Button className="w-full" onClick={() => router.push("/learn")}>
                Start Learning
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Weekly Competition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Compete with other students and climb the leaderboard.
              </p>
              <Button className="w-full" onClick={() => router.push("/competition")}>
                Join Competition
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Progress Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                View your detailed progress and performance analytics.
              </p>
              <Button className="w-full" onClick={() => router.push("/progress")}>
                View Progress
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Update your profile picture and account information.
              </p>
              <Button className="w-full" onClick={() => router.push("/profile")}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Panel Link */}
        {isAdmin && (
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Admin Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100 mb-4">
                Manage users, view statistics, and monitor system activity.
              </p>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => router.push("/admin/users")}
              >
                Access Admin Panel
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <div className="mt-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentActivity?.length > 0 ? (
                  dashboardData.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'practice' 
                          ? 'bg-green-100 dark:bg-green-900/20' 
                          : 'bg-blue-100 dark:bg-blue-900/20'
                      }`}>
                        {activity.type === 'practice' ? (
                          <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-500">
                          {activity.type === 'practice' ? `Score: ${activity.score}%` : 'Competition Entry'} • {
                            new Date(activity.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          }
                        </p>
                      </div>
                      {activity.gems > 0 && (
                        <Badge variant="secondary">+{activity.gems} gems</Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No recent activity</p>
                    <p className="text-sm">Start practicing to see your activity here!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 