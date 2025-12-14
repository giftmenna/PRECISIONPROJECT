"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Play, Pause, CheckCircle, XCircle, Award, 
  ArrowLeft, ArrowRight, Loader2 
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  prompt: string;
  choices: { [key: string]: string };
  correct: string;
  explanation: string | null;
  imageUrl: string | null;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  topic: string;
  notes: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number;
  gemsReward: number | null;
  questions: Question[];
}

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string): string => {
  try {
    // Handle youtu.be short links
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle youtube.com/watch?v= links
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Handle youtube.com/embed/ links (already in correct format)
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // If none of the above, return original URL
    return url;
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return url;
  }
};

export default function LearnModulePage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;
  
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [watchTime, setWatchTime] = useState(0);
  const saveProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (moduleId) {
      fetchModule();
      fetchVideoProgress();
      createAttempt();
    }
  }, [moduleId]);

  // Fetch saved video progress
  const fetchVideoProgress = async () => {
    try {
      const response = await fetch(`/api/learn/${moduleId}/progress`);
      if (response.ok) {
        const data = await response.json();
        setVideoProgress(data.videoProgress || 0);
        setVideoCompleted(data.videoCompleted || false);
        
        if (data.videoProgress && module) {
          setWatchTime(Math.floor((data.videoProgress / 100) * module.duration));
        }
      }
    } catch (error) {
      console.error("Error fetching video progress:", error);
    }
  };

  // Save video progress to database
  const saveVideoProgress = async (progress: number, completed: boolean) => {
    try {
      await fetch(`/api/learn/${moduleId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoProgress: progress,
          videoCompleted: completed,
        }),
      });
    } catch (error) {
      console.error("Error saving video progress:", error);
    }
  };

  // Debounced save function
  const debouncedSaveProgress = (progress: number, completed: boolean) => {
    if (saveProgressTimeoutRef.current) {
      clearTimeout(saveProgressTimeoutRef.current);
    }
    
    saveProgressTimeoutRef.current = setTimeout(() => {
      saveVideoProgress(progress, completed);
    }, 2000); // Save every 2 seconds of inactivity
  };

  // Track video watch time only when video is started
  useEffect(() => {
    if (!videoCompleted && module && videoStarted) {
      const interval = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          const progress = Math.min((newTime / module.duration) * 100, 100);
          setVideoProgress(progress);

          // Save progress periodically
          debouncedSaveProgress(progress, progress >= 90);

          // Auto-complete video when 90% watched
          if (progress >= 90 && !videoCompleted) {
            setVideoCompleted(true);
            saveVideoProgress(progress, true);
            // Add delay before allowing proceed
            setTimeout(() => {
              setCanProceed(true);
              toast.success("Video completed! You can now take the quiz.");
            }, 3000); // 3 second delay
          }

          return newTime;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
        // Save progress when component unmounts
        if (saveProgressTimeoutRef.current) {
          clearTimeout(saveProgressTimeoutRef.current);
        }
        saveVideoProgress(videoProgress, videoCompleted);
      };
    }
  }, [videoCompleted, module, videoProgress, videoStarted]);

  const fetchModule = async () => {
    try {
      const response = await fetch(`/api/learn/${moduleId}`);
      if (response.ok) {
        const data = await response.json();
        setModule(data.module);
      } else {
        toast.error("Failed to load module");
        router.push("/learn");
      }
    } catch (error) {
      console.error("Error fetching module:", error);
      toast.error("Error loading module");
    } finally {
      setLoading(false);
    }
  };

  const createAttempt = async () => {
    try {
      const response = await fetch(`/api/learn/${moduleId}/attempts`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setAttemptId(data.attemptId);
      }
    } catch (error) {
      console.error("Error creating attempt:", error);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (module?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!module || !attemptId) return;

    // Check if all questions are answered
    const unanswered = module.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions (${unanswered.length} remaining)`);
      return;
    }

    setSubmitting(true);
    try {
      // Debug logging for grading issue
      console.log("Submitting answers:", answers);
      module.questions.forEach(q => {
        console.log(`Question ${q.id}: User answer: "${answers[q.id]}", Correct: "${q.correct}"`);
      });

      const response = await fetch(`/api/learn/${moduleId}/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Submit response:", data);
        setShowResults(true);

        if (data.gemsEarned > 0) {
          toast.success(`Quiz completed! You earned ${data.gemsEarned} gems! 🎉`);
        } else {
          toast.success("Quiz completed!");
        }
      } else {
        const errorData = await response.json();
        console.error("Submit error:", errorData);
        toast.error("Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Error submitting quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateScore = () => {
    if (!module) return { correct: 0, total: 0, percentage: 0 };

    let correct = 0;
    module.questions.forEach(q => {
      const userAnswer = answers[q.id];
      const correctAnswer = q.correct;

      // Debug logging for each question
      console.log(`Question ${q.id}:`);
      console.log(`  User answer: "${userAnswer}" (type: ${typeof userAnswer})`);
      console.log(`  Correct answer: "${correctAnswer}" (type: ${typeof correctAnswer})`);
      console.log(`  Trimmed user: "${userAnswer?.trim()}"`);
      console.log(`  Trimmed correct: "${correctAnswer?.trim()}"`);
      console.log(`  Exact match: ${userAnswer === correctAnswer}`);
      console.log(`  Trimmed match: ${userAnswer?.trim() === correctAnswer?.trim()}`);
      console.log(`  Case insensitive match: ${userAnswer?.toLowerCase() === correctAnswer?.toLowerCase()}`);

      // Try multiple comparison methods
      const isCorrect = userAnswer?.trim() === correctAnswer?.trim();
      if (isCorrect) {
        correct++;
      }
    });

    const total = module.questions.length;
    const percentage = Math.round((correct / total) * 100);

    console.log(`Final score: ${correct}/${total} (${percentage}%)`);

    return { correct, total, percentage };
  };
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Module not found</p>
            <Button onClick={() => router.push("/learn")} className="mt-4">
              Back to Modules
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = module.questions[currentQuestionIndex];
  const score = showResults ? calculateScore() : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push("/learn")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Modules
        </Button>

        {/* Module Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{module.title}</CardTitle>
            <p className="text-gray-600 dark:text-gray-400">{module.description}</p>
            {module.gemsReward && module.gemsReward > 0 && (
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-medium">
                <Award className="h-5 w-5" />
                Complete to earn {module.gemsReward} gems
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Video Section */}
        {!quizStarted && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Watch the Video</CardTitle>
              <Progress value={videoProgress} className="mt-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {Math.round(videoProgress)}% completed
              </p>
            </CardHeader>
            <CardContent>
              {!videoStarted ? (
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <Button
                    onClick={() => setVideoStarted(true)}
                    size="lg"
                    className="px-8 py-4"
                  >
                    <Play className="h-6 w-6 mr-2" />
                    Start Video ({Math.round(videoProgress)}% watched)
                  </Button>
                </div>
              ) : (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {module.videoUrl.includes("youtube.com") || module.videoUrl.includes("youtu.be") ? (
                    <iframe
                      ref={videoRef}
                      src={getYouTubeEmbedUrl(module.videoUrl)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      title="Learning Module Video"
                    />
                  ) : (
                    <video
                      ref={videoRef as any}
                      src={module.videoUrl}
                      controls
                      className="w-full h-full"
                      onTimeUpdate={(e) => {
                        const video = e.target as HTMLVideoElement;
                        const progress = Math.min((video.currentTime / video.duration) * 100, 100);
                        setVideoProgress(progress);
                        debouncedSaveProgress(progress, progress >= 90);
                        if (progress >= 90 && !videoCompleted) {
                          setVideoCompleted(true);
                          saveVideoProgress(progress, true);
                          toast.success("Video completed! You can now take the quiz.");
                        }
                      }}
                    />
                  )}
                </div>
              )}

              {module.notes && videoCompleted && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Notes:</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {module.notes}
                  </p>
                </div>
              )}

              <Button
                onClick={() => setQuizStarted(true)}
                disabled={!canProceed}
                className="w-full mt-4"
                size="lg"
              >
                {canProceed ? "Start Quiz" : videoCompleted ? "Please wait..." : "Complete video to unlock quiz"}
              </Button>
              {!canProceed && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  {videoCompleted ? "Please wait a moment before proceeding..." : "Watch the video to proceed to the quiz"}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quiz Section */}
        {quizStarted && !showResults && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Quiz Questions</CardTitle>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Object.keys(answers).length}/{module.questions.length} answered
                </span>
              </div>
              <Progress
                value={(Object.keys(answers).length / module.questions.length) * 100}
                className="mt-2"
              />
            </CardHeader>
            <CardContent className="space-y-8">
              {module.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  {/* Question Header */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      {/* Question Image */}
                      {question.imageUrl && (
                        <div className="rounded-lg overflow-hidden mb-4">
                          <img
                            src={question.imageUrl}
                            alt="Question"
                            className="w-full max-h-64 object-contain bg-gray-100 dark:bg-gray-800"
                          />
                        </div>
                      )}

                      {/* Question Text */}
                      <div className="text-lg font-medium mb-4">
                        {question.prompt}
                      </div>

                      {/* Answer Choices */}
                      <div className="space-y-3">
                        {Object.entries(question.choices).map(([key, value]) => (
                          <button
                            key={key}
                            onClick={() => handleAnswerSelect(question.id, key)}
                            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                              answers[question.id] === key
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                answers[question.id] === key
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                              }`}>
                                {answers[question.id] === key && (
                                  <CheckCircle className="h-4 w-4 text-white" />
                                )}
                              </div>
                              <span className="font-medium">{key}.</span>
                              <span>{value}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={submitting || Object.keys(answers).length !== module.questions.length}
                  className="w-full"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quiz"
                  )}
                </Button>
                {Object.keys(answers).length !== module.questions.length && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Answer all questions to submit
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {showResults && score && (
          <Card>
            <CardHeader className="text-center">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                score.percentage >= 70 ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
              }`}>
                {score.percentage >= 70 ? (
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                )}
              </div>
              <CardTitle className="text-3xl">
                {score.percentage >= 70 ? "Great Job!" : "Keep Practicing!"}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                You scored {score.correct} out of {score.total} ({score.percentage}%)
              </p>
            </CardHeader>
            <CardContent>
              {/* Question Review */}
              <div className="space-y-4 mb-6">
                {module.questions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  const isCorrect = userAnswer === question.correct;
                  
                  return (
                    <div 
                      key={question.id}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect 
                          ? "border-green-200 bg-green-50 dark:bg-green-900/20" 
                          : "border-red-200 bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">
                            Question {index + 1}: {question.prompt}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Your answer:</span> {userAnswer}. {question.choices[userAnswer]}
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                              <span className="font-medium">Correct answer:</span> {question.correct}. {question.choices[question.correct]}
                            </p>
                          )}
                          {question.explanation && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              <span className="font-medium">Explanation:</span> {question.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => router.push("/learn")}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Modules
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
