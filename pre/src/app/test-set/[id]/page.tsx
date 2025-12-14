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
  Clock, 
  Target, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Brain,
  Timer,
  Award,
  Gem,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface TestQuestion {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  topic: string;
  difficulty: string;
  timeLimit: number;
  imageUrl?: string;
}

interface TestSet {
  id: string;
  name: string;
  description: string;
  questions: TestQuestion[];
  totalQuestions: number;
  requiredGems: number;
  requiredGrade?: string;
}

export default function TestSetPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [testSet, setTestSet] = useState<TestSet | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    fetchTestSet();
  }, [session, status, router, params.id]);

  useEffect(() => {
    if (!testSet || testCompleted) return;

    const currentQuestion = testSet.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setTimeLeft(currentQuestion.timeLimit || 60);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testSet, currentQuestionIndex, testCompleted]);

  const fetchTestSet = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/test-sets/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch test set');
      }

      const data = await response.json();
      setTestSet(data.testSet);
    } catch (error) {
      console.error('Error fetching test set:', error);
      toast({
        title: "Error",
        description: "Failed to load test set",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (testCompleted) return;
    
    const currentQuestion = testSet?.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (!testSet) return;

    if (currentQuestionIndex < testSet.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleCompleteTest();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleCompleteTest = async () => {
    if (!testSet) return;

    setSubmitting(true);
    setTestCompleted(true);

    try {
      // Calculate score
      let correctAnswers = 0;
      const totalQuestions = testSet.questions.length;

      testSet.questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (userAnswer === question.correct) {
          correctAnswers++;
        }
      });

      const finalScore = Math.round((correctAnswers / totalQuestions) * 100);
      setScore(finalScore);

      // Save test attempt
      const response = await fetch('/api/test-sets/attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testSetId: testSet.id,
          score: finalScore,
          totalQuestions,
          correctAnswers,
          answers,
          timeSpent: 0 // TODO: Calculate actual time spent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save test results');
      }

      toast({
        title: "Test Completed!",
        description: `You scored ${finalScore}% (${correctAnswers}/${totalQuestions} correct)`,
        variant: finalScore >= 70 ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Error completing test:', error);
      toast({
        title: "Error",
        description: "Failed to save test results",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getChoiceStyle = (choice: string) => {
    const currentQuestion = testSet?.questions[currentQuestionIndex];
    if (!currentQuestion) return "";

    const userAnswer = answers[currentQuestion.id];
    
    if (!testCompleted) {
      return userAnswer === choice 
        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 dark:border-gray-600 dark:hover:border-blue-400";
    }
    
    if (choice === currentQuestion.correct) {
      return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }
    
    if (choice === userAnswer && choice !== currentQuestion.correct) {
      return "border-red-500 bg-red-50 dark:bg-red-900/20";
    }
    
    return "border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50";
  };

  const getChoiceIcon = (choice: string) => {
    if (!testCompleted) return null;
    
    const currentQuestion = testSet?.questions[currentQuestionIndex];
    if (!currentQuestion) return null;
    
    if (choice === currentQuestion.correct) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    if (choice === answers[currentQuestion.id] && choice !== currentQuestion.correct) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading test set...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!testSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Test set not found</p>
            <Link href="/competition">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Competitions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = testSet.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/competition">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Competitions
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Badge variant="outline">{testSet.name}</Badge>
            <Badge className={getDifficultyColor('medium')}>Test Set</Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Question {currentQuestionIndex + 1} of {testSet.totalQuestions}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(((currentQuestionIndex + 1) / testSet.totalQuestions) * 100)}% complete
            </div>
          </div>
          <Progress 
            value={((currentQuestionIndex + 1) / testSet.totalQuestions) * 100} 
            className="h-2"
          />
        </div>

        {/* Timer */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Time Remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round((timeLeft / (currentQuestion?.timeLimit || 60)) * 100)}% remaining
            </div>
          </div>
          <Progress 
            value={(timeLeft / (currentQuestion?.timeLimit || 60)) * 100} 
            className="h-2"
          />
        </div>

        {/* Question Card */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Question {currentQuestionIndex + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {currentQuestion?.topic}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentQuestion?.prompt}
                  </p>
                  
                  {/* Display image if available */}
                  {currentQuestion?.imageUrl && (
                    <div className="mt-4">
                      <img 
                        src={currentQuestion.imageUrl} 
                        alt="Question diagram" 
                        className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.error('Failed to load image:', target.src);
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Answer Choices */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-gray-600" />
                Select your answer:
              </h4>
              <div className="grid gap-3">
                {currentQuestion?.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(choice)}
                    disabled={testCompleted}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${getChoiceStyle(choice)} ${
                      !testCompleted ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {choice}
                        </span>
                      </div>
                      {getChoiceIcon(choice)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0 || testCompleted}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {testCompleted && (
                  <Badge variant={score >= 70 ? "default" : "destructive"} className="text-sm">
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Score: {score}%
                    </div>
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                {!testCompleted && (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!answers[currentQuestion?.id || ''] || submitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </div>
                    ) : currentQuestionIndex === testSet.questions.length - 1 ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Complete Test
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                )}
                
                {testCompleted && (
                  <Link href="/competition">
                    <Button>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Competitions
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 