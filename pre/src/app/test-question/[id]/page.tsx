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
  Gem
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
  requiredGrade?: string;
  requiredGems?: number;
}

export default function TestQuestionPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [question, setQuestion] = useState<TestQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    fetchQuestion();
  }, [session, status, router, params.id]);

  useEffect(() => {
    if (!question || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [question, isAnswered]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/questions/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }

      const data = await response.json();
      setQuestion(data.question);
      setTimeLeft(data.question.timeLimit || 60);
    } catch (error) {
      console.error('Error fetching question:', error);
      toast({
        title: "Error",
        description: "Failed to load test question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!question || !selectedAnswer || isAnswered) return;

    setSubmitting(true);
    setIsAnswered(true);

    try {
      const isCorrect = selectedAnswer?.trim().toLowerCase() === question.correct?.trim().toLowerCase();
      const timeSpent = (question.timeLimit || 60) - timeLeft;

      // Save the attempt
      const response = await fetch('/api/practice/save-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
          selectedAnswer,
          isCorrect,
          timeSpent: timeSpent * 1000, // Convert to milliseconds
          gemsEarned: isCorrect ? getGemReward(question.difficulty) : 0
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save results');
      }

      const result = await response.json();

      toast({
        title: isCorrect ? "Correct!" : "Incorrect",
        description: isCorrect 
          ? `You earned ${getGemReward(question.difficulty)} gems!` 
          : "Better luck next time!",
        variant: isCorrect ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getGemReward = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      default: return 1;
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
    if (!isAnswered) {
      return selectedAnswer === choice 
        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 dark:border-gray-600 dark:hover:border-blue-400";
    }
    
    if (choice === question?.correct) {
      return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }
    
    if (choice === selectedAnswer && choice !== question?.correct) {
      return "border-red-500 bg-red-50 dark:bg-red-900/20";
    }
    
    return "border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50";
  };

  const getChoiceIcon = (choice: string) => {
    if (!isAnswered) return null;
    
    if (choice === question?.correct) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    if (choice === selectedAnswer && choice !== question?.correct) {
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
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading test question...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Question not found</p>
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
            <Badge className={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
            <Badge variant="outline">{question.topic}</Badge>
          </div>
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
              {Math.round((timeLeft / (question.timeLimit || 60)) * 100)}% remaining
            </div>
          </div>
          <Progress 
            value={(timeLeft / (question.timeLimit || 60)) * 100} 
            className="h-2"
          />
        </div>

        {/* Question Card */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Test Question
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Question
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {question.prompt}
                  </p>
                  
                  {/* Display image if available */}
                  {question.imageUrl && (
                    <div className="mt-4">
                      <img 
                        src={question.imageUrl} 
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
                {Array.isArray(question.choices) ? question.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => !isAnswered && setSelectedAnswer(choice)}
                    disabled={isAnswered}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${getChoiceStyle(choice)} ${
                      !isAnswered ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
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
                )) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No answer choices available for this question.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <div className="flex items-center gap-2">
                {isAnswered && (
                  <Badge variant={selectedAnswer === question.correct ? "default" : "destructive"} className="text-sm">
                    {selectedAnswer === question.correct ? (
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        +{getGemReward(question.difficulty)} gems earned
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        No gems earned
                      </div>
                    )}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                {!isAnswered && (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer || submitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Submit Answer
                      </div>
                    )}
                  </Button>
                )}
                
                {isAnswered && (
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