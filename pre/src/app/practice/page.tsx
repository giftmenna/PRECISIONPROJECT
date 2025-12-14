"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight,
  Target,
  Clock,
  Gem,
  Filter,
  RefreshCw,
  Timer,
  Brain,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PracticeQuestion {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  topic: string;
  difficulty: string;
  explanation?: string;
  imageUrl?: string;
  timeLimit: number;
  gems: number;
}

interface PracticeSession {
  questions: PracticeQuestion[];
  currentIndex: number;
  answers: { [questionId: string]: string };
  startTime: Date;
  stats: {
    correct: number;
    total: number;
    gemsEarned: number;
  };
}

export default function PracticePage() {
  const { data: authSession, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  // Core state
  const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    topic: "",
    difficulty: "",
    limit: 10
  });
  
  // Available topics and difficulties
  const topics = [
    "addition_and_subtraction_of_integers",
    "angles", "area", "direct_proportion", "direct_variation",
    "exterior_angles_in_polygons", "fractions", "indices",
    "indirect_proportion", "indirect_variation", "interior_angles_in_polygons",
    "linear_equations_and_graphs", "linear_inequalities", "percentage",
    "perimeter", "place_value", "profit_and_loss", "quadratics",
    "ratio", "roman_numerals", "simultaneous_equations",
    "surds", "triangles", "trigonometry", "unit_conversion"
  ];
  
  const difficulties = ["easy", "medium", "hard"];

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Start new practice session
  const startPractice = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: filters.limit.toString()
      });
      
      if (filters.topic) params.append('topic', filters.topic);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);

      const response = await fetch(`/api/practice/questions?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      
      if (!data.questions || data.questions.length === 0) {
        toast({
          title: "No Questions Available",
          description: "Try adjusting your filters or check back later for new questions.",
        });
        return;
      }

      const newSession: PracticeSession = {
        questions: data.questions,
        currentIndex: 0,
        answers: {},
        startTime: new Date(),
        stats: {
          correct: 0,
          total: 0,
          gemsEarned: 0
        }
      };

      setPracticeSession(newSession);
      
      toast({
        title: "Practice Started!",
        description: `You have ${data.questions.length} questions to practice.`,
      });

    } catch (error) {
      console.error('Error starting practice:', error);
      toast({
        title: "Error",
        description: "Failed to start practice session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit answer
  const submitAnswer = async (answer: string) => {
    if (!practiceSession) return;

    const currentQuestion = practiceSession.questions[practiceSession.currentIndex];
    const isCorrect = answer === currentQuestion.correct;
    const gemsEarned = isCorrect ? currentQuestion.gems : 0;

    // Update session
    const updatedSession = {
      ...practiceSession,
      answers: {
        ...practiceSession.answers,
        [currentQuestion.id]: answer
      },
      stats: {
        ...practiceSession.stats,
        correct: practiceSession.stats.correct + (isCorrect ? 1 : 0),
        total: practiceSession.stats.total + 1,
        gemsEarned: practiceSession.stats.gemsEarned + gemsEarned
      }
    };

    setPracticeSession(updatedSession);

    // Save to database
    setSubmitting(true);
    try {
      await fetch('/api/practice/save-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: [{
            questionId: currentQuestion.id,
            isCorrect,
            gemsEarned
          }]
        }),
      });
    } catch (error) {
      console.error('Error saving result:', error);
    } finally {
      setSubmitting(false);
    }

    // Show feedback
    toast({
      title: isCorrect ? "Correct!" : "Incorrect",
      description: isCorrect 
        ? `Great job! You earned ${gemsEarned} gems.` 
        : `The correct answer was: ${currentQuestion.correct}`,
      variant: isCorrect ? "default" : "destructive",
    });
  };

  // Navigate questions
  const goToNext = () => {
    if (!practiceSession) return;
    if (practiceSession.currentIndex < practiceSession.questions.length - 1) {
      setPracticeSession({
        ...practiceSession,
        currentIndex: practiceSession.currentIndex + 1
      });
    }
  };

  const goToPrevious = () => {
    if (!practiceSession) return;
    if (practiceSession.currentIndex > 0) {
      setPracticeSession({
        ...practiceSession,
        currentIndex: practiceSession.currentIndex - 1
      });
    }
  };

  // Reset practice
  const resetPractice = () => {
    setPracticeSession(null);
  };

  // Helper functions
  const getTopicDisplayName = (topic: string): string => {
    return topic.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!authSession) {
    return null;
  }

  // Loading questions
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading practice questions...</p>
        </div>
      </div>
    );
  }

  // No active session - show setup
  if (!practiceSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Practice Mode
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Sharpen your skills with personalized practice questions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="p-6 text-center">
                <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Smart Practice</h3>
                <p className="text-blue-700 dark:text-blue-300">Questions tailored to your learning needs</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Track Progress</h3>
                <p className="text-green-700 dark:text-green-300">Monitor your improvement over time</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardContent className="p-6 text-center">
                <Gem className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Earn Rewards</h3>
                <p className="text-purple-700 dark:text-purple-300">Get gems for correct answers</p>
              </CardContent>
            </Card>
          </div>

          {/* Practice Setup */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Practice Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic
                  </label>
                  <select
                    value={filters.topic}
                    onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm max-w-full overflow-hidden"
                    style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
                  >
                    <option value="" className="text-xs sm:text-sm">All Topics</option>
                    {topics.map((topic) => (
                      <option key={topic} value={topic} className="text-xs sm:text-sm">
                        {getTopicDisplayName(topic)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm"
                    style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
                  >
                    <option value="">All Difficulties</option>
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Questions
                  </label>
                  <select
                    value={filters.limit}
                    onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value) })}
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm"
                    style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={startPractice}
                  disabled={loading}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Practice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Active practice session
  const currentQuestion = practiceSession.questions[practiceSession.currentIndex];
  const isAnswered = practiceSession.answers[currentQuestion.id] !== undefined;
  const userAnswer = practiceSession.answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Practice Mode</h1>
            <p className="text-gray-600 dark:text-gray-400">Question {practiceSession.currentIndex + 1} of {practiceSession.questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={resetPractice} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              New Practice
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Answered</p>
                  <p className="text-2xl font-bold text-blue-600">{practiceSession.stats.total}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Correct</p>
                  <p className="text-2xl font-bold text-green-600">{practiceSession.stats.correct}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {practiceSession.stats.total > 0 ? Math.round((practiceSession.stats.correct / practiceSession.stats.total) * 100) : 0}%
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gems Earned</p>
                  <p className="text-2xl font-bold text-yellow-600">{practiceSession.stats.gemsEarned}</p>
                </div>
                <Gem className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round((Object.keys(practiceSession.answers).length / practiceSession.questions.length) * 100)}%
            </span>
          </div>
          <Progress 
            value={(Object.keys(practiceSession.answers).length / practiceSession.questions.length) * 100} 
            className="h-2" 
          />
        </div>

        {/* Question Card */}
        <Card className="max-w-4xl mx-auto mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                  <span className="text-xs">{currentQuestion.difficulty}</span>
                </Badge>
                <Badge variant="outline" className="max-w-[200px] sm:max-w-none">
                  <span className="text-xs truncate">{getTopicDisplayName(currentQuestion.topic)}</span>
                </Badge>
                {currentQuestion.gems > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Gem className="h-3 w-3" />
                    <span className="text-xs">{currentQuestion.gems} gems</span>
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentQuestion.prompt}
              </h2>
              
              {currentQuestion.imageUrl && (
                <div className="mb-6">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question"
                    className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}

              <div className="space-y-3">
                {currentQuestion.choices.map((choice, index) => {
                  const isSelected = userAnswer === choice;
                  const isCorrect = choice === currentQuestion.correct;
                  const showCorrect = isAnswered && isCorrect;
                  const showIncorrect = isAnswered && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => !isAnswered && submitAnswer(choice)}
                      disabled={isAnswered}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        showCorrect
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : showIncorrect
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          showCorrect
                            ? 'border-green-500 bg-green-500'
                            : showIncorrect
                            ? 'border-red-500 bg-red-500'
                            : isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && (
                            <CheckCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <span className="text-gray-900 dark:text-white">{choice}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation */}
            {isAnswered && currentQuestion.explanation && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Explanation
                </h3>
                <p className="text-blue-800 dark:text-blue-200">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                onClick={goToPrevious}
                disabled={practiceSession.currentIndex === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: practiceSession.questions.length }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPracticeSession({ ...practiceSession, currentIndex: i })}
                    className={`w-3 h-3 rounded-full ${
                      i === practiceSession.currentIndex
                        ? 'bg-blue-600'
                        : practiceSession.answers[practiceSession.questions[i].id]
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={goToNext}
                disabled={practiceSession.currentIndex === practiceSession.questions.length - 1}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}