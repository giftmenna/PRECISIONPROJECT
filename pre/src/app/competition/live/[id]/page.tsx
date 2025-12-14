"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Clock, 
  Target, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Brain,
  Timer,
  Award,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import QuestionCard from "@/components/QuestionCard";

interface CompetitionQuestion {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  topic: string;
  difficulty: string;
  explanation?: string;
  imageUrl?: string;
  youtubeUrl?: string;
  questionType?: string;
}

interface Competition {
  id: string;
  name: string;
  description: string;
  startsAt: string;
  endsAt: string;
  entryPriceGem: number;
  prizeCashNgn: number;
  participants: number;
  status: string;
  questions: CompetitionQuestion[];
}

export default function LiveCompetitionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const competitionId = params.id as string;
  
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<CompetitionQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gemsEarned, setGemsEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [competitionComplete, setCompetitionComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [attemptsToLeave, setAttemptsToLeave] = useState(0);
  
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Anti-cheating measures
  useEffect(() => {
    if (!competition) return;

    // Prevent context menu (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setAttemptsToLeave(prev => prev + 1);
      if (attemptsToLeave >= 3) {
        handleCheatingDetected("Multiple right-click attempts detected");
      }
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common shortcuts
      if (
        (e.ctrlKey || e.metaKey) && (
          e.key === 'c' || // Copy
          e.key === 'v' || // Paste
          e.key === 'a' || // Select all
          e.key === 's' || // Save
          e.key === 'p' || // Print
          e.key === 'f' || // Find
          e.key === 'u' || // View source
          e.key === 'i' || // Inspect
          e.key === 'j' || // Developer tools
          e.key === 'k' || // Developer tools
          e.key === 'l' || // Developer tools
          e.key === 'm' || // Developer tools
          e.key === 'n' || // Developer tools
          e.key === 'o' || // Developer tools
          e.key === 'q' || // Developer tools
          e.key === 'r' || // Refresh
          e.key === 't' || // New tab
          e.key === 'w' || // Close tab
          e.key === 'z' || // Undo
          e.key === 'y' || // Redo
          e.key === 'x' || // Cut
          e.key === 'd' || // Bookmark
          e.key === 'e' || // Developer tools
          e.key === 'g' || // Developer tools
          e.key === 'h' || // Developer tools
          e.key === 'b' || // Developer tools
          e.key === '1' || // Developer tools
          e.key === '2' || // Developer tools
          e.key === '3' || // Developer tools
          e.key === '4' || // Developer tools
          e.key === '5' || // Developer tools
          e.key === '6' || // Developer tools
          e.key === '7' || // Developer tools
          e.key === '8' || // Developer tools
          e.key === '9' || // Developer tools
          e.key === '0'    // Developer tools
        )
      ) {
        e.preventDefault();
        setAttemptsToLeave(prev => prev + 1);
        if (attemptsToLeave >= 3) {
          handleCheatingDetected("Multiple keyboard shortcut attempts detected");
        }
      }

      // Prevent F12, F5, etc.
      if (e.key === 'F12' || e.key === 'F5' || e.key === 'F11') {
        e.preventDefault();
        setAttemptsToLeave(prev => prev + 1);
        if (attemptsToLeave >= 3) {
          handleCheatingDetected("Function key attempts detected");
        }
      }
    };

    // Prevent leaving the page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Leaving this page will end your competition. Are you sure?";
      return "Leaving this page will end your competition. Are you sure?";
    };

    // Prevent visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setAttemptsToLeave(prev => prev + 1);
        if (attemptsToLeave >= 2) {
          handleCheatingDetected("Multiple tab switching attempts detected");
        }
      }
    };

    // Prevent fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setAttemptsToLeave(prev => prev + 1);
        if (attemptsToLeave >= 2) {
          handleCheatingDetected("Fullscreen exit detected");
        }
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Request fullscreen
    if (fullscreenRef.current && !document.fullscreenElement) {
      fullscreenRef.current.requestFullscreen().catch(() => {
        setShowWarning(true);
      });
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [competition, attemptsToLeave]);

  const handleCheatingDetected = (reason: string) => {
    alert(`Competition terminated: ${reason}`);
    handleCompetitionComplete();
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    fetchCompetition();
  }, [session, status, router, competitionId]);

  useEffect(() => {
    if (!loading && !competitionComplete && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleCompetitionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, competitionComplete]); // Removed timeLeft dependency

  const fetchCompetition = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/competitions/${competitionId}/live`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch competition');
      }
      
      const data = await response.json();
      setCompetition(data.competition);
      setTotalQuestions(data.competition.questions.length);
      
      if (data.competition.questions.length > 0) {
        setCurrentQuestion(data.competition.questions[0]);
      }
    } catch (error) {
      console.error('Error fetching competition:', error);
      setError('Failed to load competition');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    setIsAnswered(true);
    const isCorrect = selectedAnswer === currentQuestion.correct;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      // Higher gem rewards for competition
      const gemReward = getCompetitionGemReward(currentQuestion.difficulty);
      setGemsEarned(prev => prev + gemReward);
    }
  };

  const handleNextQuestion = () => {
    if (!competition) return;
    
    if (currentQuestionIndex + 1 >= competition.questions.length) {
      handleCompetitionComplete();
      return;
    }

    setCurrentQuestionIndex(prev => prev + 1);
    setCurrentQuestion(competition.questions[currentQuestionIndex + 1]);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const getCompetitionGemReward = (difficulty: string) => {
    // Higher rewards for competition vs practice
    switch (difficulty.toLowerCase()) {
      case 'easy': return 0.01; // 10x practice reward
      case 'medium': return 0.05; // 10x practice reward
      case 'hard': return 1.0; // 10x practice reward
      default: return 0.01;
    }
  };

  const handleCompetitionComplete = async () => {
    setCompetitionComplete(true);
    
    try {
      const response = await fetch('/api/competitions/submit-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          competitionId,
          score,
          totalQuestions,
          gemsEarned,
          timeSpent: 1800 - timeLeft,
          startTime: startTimeRef.current
        })
      });

      if (!response.ok) {
        console.error('Failed to submit competition results');
      }
    } catch (error) {
      console.error('Error submitting competition results:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading competition...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Competition Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={() => router.push('/competition')}>
            Back to Competitions
          </Button>
        </div>
      </div>
    );
  }

  if (competitionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Competition Complete!</h1>
            <p className="text-gray-600 dark:text-gray-400">Great job on completing the competition</p>
          </div>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{score}/{totalQuestions}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{Math.round((score / totalQuestions) * 100)}%</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{gemsEarned}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gems Earned</p>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={() => router.push('/competition')} 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                >
                  Back to Competitions
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard')} 
                  variant="outline" 
                  className="w-full h-12"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div ref={fullscreenRef} className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      {/* Anti-cheating warning */}
      {showWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Please enable fullscreen for the best experience
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/20 px-3 py-1 rounded-lg">
              <Lock className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">Live Competition</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-lg">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="font-semibold">{competition?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-lg">
              <Clock className="h-4 w-4 text-red-500" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-lg">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{gemsEarned}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {score} correct
              </span>
            </div>
          </div>
          <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="h-2" />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            selectedAnswer={selectedAnswer}
            isAnswered={isAnswered}
            timeLeft={timeLeft}
            onAnswerSelect={handleAnswerSelect}
            onSubmitAnswer={handleSubmitAnswer}
            onNextQuestion={handleNextQuestion}
          />
        )}
      </div>
    </div>
  );
} 