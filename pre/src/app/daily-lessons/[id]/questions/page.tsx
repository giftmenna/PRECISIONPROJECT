"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  topic: string;
  difficulty: string;
  explanation?: string;
  imageUrl?: string;
  timeLimit?: number;
}

export default function DailyLessonQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.id as string;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/daily-lessons/${lessonId}/questions`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load questions");
        setQuestions(data.questions || []);
        setLoading(false);
      } catch (e: any) {
        setError(e.message || "Failed to load questions");
        setLoading(false);
      }
    };
    if (lessonId) load();
  }, [lessonId]);

  useEffect(() => {
    if (!questions.length) return;
    const limit = questions[currentIndex]?.timeLimit || 60;
    setTimeLeft(limit);
    const timer = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [currentIndex, questions]);

  const onSubmitAnswer = () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);
  };

  const onNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      router.push("/dashboard");
    }
  };

  if (loading) {
    return (
      <Card className="max-w-3xl mx-auto mt-6">
        <CardContent className="p-6">Loading questions...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-3xl mx-auto mt-6">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent className="p-6">{error}</CardContent>
      </Card>
    );
  }

  if (!questions.length) {
    return (
      <Card className="max-w-3xl mx-auto mt-6">
        <CardHeader>
          <CardTitle>No Questions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          No questions attached to this lesson yet.
          <div className="mt-4">
            <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="p-4">
      <QuestionCard
        question={{
          id: q.id,
          prompt: q.prompt,
          choices: q.choices,
          correct: q.correct,
          topic: q.topic,
          difficulty: q.difficulty,
          explanation: q.explanation,
          imageUrl: q.imageUrl,
        } as any}
        currentQuestionIndex={currentIndex}
        totalQuestions={questions.length}
        selectedAnswer={selectedAnswer}
        isAnswered={isAnswered}
        timeLeft={timeLeft}
        onAnswerSelect={(a) => setSelectedAnswer(a)}
        onSubmitAnswer={onSubmitAnswer}
        onNextQuestion={onNextQuestion}
      />
    </div>
  );
} 