"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DailyLessonQuestion } from "@/types/daily-lesson";
import { Trash2, Plus } from "lucide-react";

interface DailyLessonQuestionFormProps {
  lessonId: string;
  initialQuestions?: DailyLessonQuestion[];
  onSave: (questions: Omit<DailyLessonQuestion, 'id' | 'lessonId' | 'order'>[]) => void;
  onCancel: () => void;
}

export function DailyLessonQuestionForm({
  lessonId,
  initialQuestions = [],
  onSave,
  onCancel
}: DailyLessonQuestionFormProps) {
  const [questions, setQuestions] = useState<Array<{
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
  }>>(initialQuestions.map(q => ({
    questionText: q.questionText,
    options: q.options,
    correctOptionIndex: q.correctOptionIndex,
    explanation: q.explanation
  })));

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        explanation: ""
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: string, value: string | number | string[]) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(questions);
  };

  const isValid = () => {
    return questions.every(q => 
      q.questionText.trim() !== "" &&
      q.options.every(opt => opt.trim() !== "") &&
      q.correctOptionIndex >= 0 &&
      q.correctOptionIndex < q.options.length
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((question, questionIndex) => (
        <Card key={questionIndex}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveQuestion(questionIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`question-${questionIndex}`}>Question Text</Label>
              <Textarea
                id={`question-${questionIndex}`}
                value={question.questionText}
                onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                placeholder="Enter your question"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Options</Label>
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                    placeholder={`Option ${optionIndex + 1}`}
                    required
                  />
                  <Button
                    type="button"
                    variant={question.correctOptionIndex === optionIndex ? "default" : "outline"}
                    onClick={() => handleQuestionChange(questionIndex, 'correctOptionIndex', optionIndex)}
                  >
                    Correct
                  </Button>
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor={`explanation-${questionIndex}`}>Explanation (Optional)</Label>
              <Textarea
                id={`explanation-${questionIndex}`}
                value={question.explanation || ""}
                onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                placeholder="Explain why the correct answer is correct"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={handleAddQuestion} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid() || questions.length === 0}>
          Save Questions
        </Button>
      </div>
    </form>
  );
}