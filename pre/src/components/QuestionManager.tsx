import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DailyLesson, DailyLessonQuestion } from '@/types/daily-lesson';

interface QuestionManagerProps {
  lesson: DailyLesson;
  onUpdate: () => void;
}

export function QuestionManager({ lesson, onUpdate }: QuestionManagerProps) {
  const [questions, setQuestions] = useState<DailyLessonQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lesson.id) {
      fetchQuestions();
    }
  }, [lesson.id]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/admin/daily-lessons/${lesson.id}/questions`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (questionId: string, newPosition: number) => {
    try {
      const response = await fetch(`/api/admin/daily-lessons/${lesson.id}/questions/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, newPosition }),
      });
      
      if (!response.ok) throw new Error('Failed to reorder question');
      
      toast({
        title: "Success",
        description: "Question order updated",
      });
      
      await fetchQuestions();
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder question",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (questionId: string) => {
    if (!confirm('Are you sure you want to remove this question?')) return;

    try {
      const response = await fetch(`/api/admin/daily-lessons/${lesson.id}/questions/${questionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to remove question');
      
      toast({
        title: "Success",
        description: "Question removed",
      });
      
      await fetchQuestions();
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove question",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading questions...</div>;
  }

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          Questions ({questions.length})
        </CardTitle>
        <Button size="sm" onClick={() => window.location.href = `/admin/questions/create?lessonId=${lesson.id}`}>
          <Plus className="mr-1 h-4 w-4" />
          Add Question
        </Button>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No questions added yet. Click &quot;Add Question&quot; to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {questions.map((q, index) => (
              <div key={q.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{index + 1}. {q.question.prompt}</p>
                  <p className="text-sm text-muted-foreground">
                    {q.question.topic} · {q.question.difficulty}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorder(q.questionId, index - 1)}
                    >
                      ↑
                    </Button>
                  )}
                  {index < questions.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorder(q.questionId, index + 1)}
                    >
                      ↓
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = `/admin/questions/edit/${q.questionId}?lessonId=${lesson.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(q.questionId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
