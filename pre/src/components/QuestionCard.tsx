"use client";

import { useState } from "react";
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
  ArrowRight,
  Brain,
  Timer,
  Award,
  Gem
} from "lucide-react";
import GemRequirement from "./GemRequirement";

interface Question {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  topic: string;
  difficulty: string;
  explanation?: string;
  imageUrl?: string;
  youtubeUrl?: string;
  imageData?: string;
  questionType?: string;
  timeLimit?: number;
  requiredGrade?: string | null;
  requiredGems?: number;
  hasEnoughGems?: boolean;
  userGems?: number;
}

interface QuestionCardProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  timeLeft: number;
  wasPreviouslyAnswered?: boolean;
  previousAttempt?: { isCorrect: boolean; gemsEarned: number };
  onAnswerSelect: (answer: string) => void;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
}

export default function QuestionCard({
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  isAnswered,
  timeLeft,
  wasPreviouslyAnswered = false,
  previousAttempt,
  onAnswerSelect,
  onSubmitAnswer,
  onNextQuestion
}: QuestionCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const correctAnswer = question.correct;
  const isCorrect = selectedAnswer === correctAnswer;
  
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
    
    if (choice === correctAnswer) {
      return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }
    
    if (choice === selectedAnswer && choice !== correctAnswer) {
      return "border-red-500 bg-red-50 dark:bg-red-900/20";
    }
    
    return "border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50";
  };

  const getGemReward = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 0.001;
      case 'medium': return 0.005;
      case 'hard': return 0.1;
      default: return 0.001;
    }
  };

  const getChoiceIcon = (choice: string) => {
    if (!isAnswered) return null;
    
    if (choice === correctAnswer) {
      return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
    }
    
    if (choice === selectedAnswer && choice !== correctAnswer) {
      return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    }
    
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <div className="flex items-center gap-2">
            <Timer className={`h-4 w-4 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${timeLeft <= 10 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {question.topic}
                </CardTitle>
                <div className="flex gap-2 mt-1">
                  <Badge className={`${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </Badge>
                  {question.requiredGrade && (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                      {question.requiredGrade}
                    </Badge>
                  )}
                  {question.requiredGems && question.requiredGems > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      <Gem className="h-3 w-3 mr-1" />
                      {question.requiredGems} gems
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentQuestionIndex + 1}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                of {totalQuestions}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Previously Answered Notice */}
          {wasPreviouslyAnswered && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    Review Mode
                  </h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    You've already answered this question. {previousAttempt?.isCorrect ? 
                      `You earned ${previousAttempt.gemsEarned} gems previously.` : 
                      'No gems earned previously.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gem Requirement */}
          {question.requiredGems && question.requiredGems > 0 && (
            <GemRequirement
              requiredGems={question.requiredGems}
              userGems={question.userGems || 0}
              questionId={question.id}
              onProceed={!wasPreviouslyAnswered && question.hasEnoughGems ? onSubmitAnswer : undefined}
            />
          )}

          {/* Question Prompt */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Question
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {question.prompt}
                </p>
                
                {/* Display image if available */}
                {(question.imageUrl || question.imageData) && (
                  <div className="mt-4">
                    <img 
                      src={question.imageData || question.imageUrl} 
                      alt="Question diagram" 
                      className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('Failed to load image:', target.src);
                        target.style.display = 'none';
                        // Show a fallback message
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'text-center py-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg';
                        fallbackDiv.textContent = 'Image could not be loaded';
                        target.parentNode?.appendChild(fallbackDiv);
                      }}
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', (e.target as HTMLImageElement).src);
                      }}
                    />
                  </div>
                )}
                
                {/* Display YouTube video if available */}
                {question.youtubeUrl && (
                  <div className="mt-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm">
                      <iframe
                        src={question.youtubeUrl.includes('embed') 
                          ? question.youtubeUrl 
                          : question.youtubeUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                        }
                        title="Question video"
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                        onError={(e) => {
                          console.error('Failed to load YouTube video:', question.youtubeUrl);
                          const target = e.target as HTMLIFrameElement;
                          const fallbackDiv = document.createElement('div');
                          fallbackDiv.className = 'flex items-center justify-center h-full text-center py-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
                          fallbackDiv.innerHTML = '<div><p>Video could not be loaded</p><p class="text-sm mt-1">URL: ' + question.youtubeUrl + '</p></div>';
                          target.parentNode?.appendChild(fallbackDiv);
                          target.style.display = 'none';
                        }}
                      />
                    </div>
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
                  onClick={() => !isAnswered && onAnswerSelect(choice)}
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

          {/* Explanation (shown after answering) */}
          {isAnswered && question.explanation && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl p-6 border border-green-100 dark:border-green-800">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-white" />
                  ) : (
                    <XCircle className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center gap-2">
              {isAnswered && (
                <Badge variant={isCorrect ? "default" : "destructive"} className="text-sm">
                  {isCorrect ? (
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
            
            <div className="flex gap-3">
              {!isAnswered ? (
                <Button
                  onClick={onSubmitAnswer}
                  disabled={!selectedAnswer}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={onNextQuestion}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2"
                >
                  <span>Next Question</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 