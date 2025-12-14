"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Upload, Image as ImageIcon, Link, X } from 'lucide-react';
import { TOPICS } from '@/lib/topics';

interface Question {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  topic: string;
  difficulty: string;
  imageUrl?: string;
  imageData?: string;
  timeLimit: number;
}

interface CompetitionQuestionBuilderProps {
  competitionType: 'weekly' | 'grade' | 'test' | 'set';
  onSave: (questions: Question[]) => void;
  onCancel: () => void;
  initialQuestions?: Question[];
}

export default function CompetitionQuestionBuilder({
  competitionType,
  onSave,
  onCancel,
  initialQuestions = []
}: CompetitionQuestionBuilderProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: `q_${Date.now()}`,
    prompt: '',
    choices: ['', '', '', ''],
    correct: '',
    topic: '',
    difficulty: 'MEDIUM',
    imageUrl: '',
    imageData: '',
    timeLimit: 60
  });
  const [imageUploadMethod, setImageUploadMethod] = useState<'url' | 'file'>('url');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const addQuestion = () => {
    if (!currentQuestion.prompt.trim()) {
      alert('Please enter a question prompt');
      return;
    }
    if (!currentQuestion.topic) {
      alert('Please select a topic');
      return;
    }
    // Check if at least 2 choices are filled
    const filledChoices = currentQuestion.choices.filter(choice => choice.trim());
    if (filledChoices.length < 2) {
      alert('Please fill in at least 2 choices');
      return;
    }
    if (!currentQuestion.correct) {
      alert('Please select the correct answer');
      return;
    }

    setQuestions(prevQuestions => [...prevQuestions, { ...currentQuestion }]);
    
    setCurrentQuestion({
      id: `q_${Date.now()}`,
      prompt: '',
      choices: ['', '', '', ''],
      correct: '',
      topic: '',
      difficulty: 'MEDIUM',
      imageUrl: '',
      imageData: '',
      timeLimit: 60
    });
    setImageFile(null);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentQuestion({
          ...currentQuestion,
          imageUrl: data.url,
          imageData: data.imageData
        });
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const handleSave = () => {
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    onSave(questions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Build {competitionType.charAt(0).toUpperCase() + competitionType.slice(1)} Questions
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Question Builder */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Question
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Question Prompt */}
                  <div>
                    <Label htmlFor="prompt">Question Prompt</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Enter your question here..."
                      value={currentQuestion.prompt}
                      onChange={(e) => setCurrentQuestion({
                        ...currentQuestion,
                        prompt: e.target.value
                      })}
                      rows={3}
                    />
                  </div>

                  {/* Topic Selection */}
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Select
                      value={currentQuestion.topic}
                      onValueChange={(value) => setCurrentQuestion({
                        ...currentQuestion,
                        topic: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {TOPICS.map((topic) => (
                          <SelectItem key={topic} value={topic}>
                            {topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={currentQuestion.difficulty}
                      onValueChange={(value) => setCurrentQuestion({
                        ...currentQuestion,
                        difficulty: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">Easy</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HARD">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time Limit */}
                  <div>
                    <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="30"
                      max="3600"
                      value={currentQuestion.timeLimit}
                      onChange={(e) => setCurrentQuestion({
                        ...currentQuestion,
                        timeLimit: parseInt(e.target.value) || 60
                      })}
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <Label>Question Image (Optional)</Label>
                    <div className="flex gap-2 mb-2">
                      <Button
                        type="button"
                        variant={imageUploadMethod === 'url' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setImageUploadMethod('url')}
                      >
                        <Link className="h-4 w-4 mr-1" />
                        URL
                      </Button>
                      <Button
                        type="button"
                        variant={imageUploadMethod === 'file' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setImageUploadMethod('file')}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </Button>
                    </div>

                    {imageUploadMethod === 'url' ? (
                      <Input
                        placeholder="Enter image URL (Google Drive, Dropbox, etc.)"
                        value={currentQuestion.imageUrl}
                        onChange={(e) => setCurrentQuestion({
                          ...currentQuestion,
                          imageUrl: e.target.value
                        })}
                      />
                    ) : (
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImageFile(file);
                              handleImageUpload(file);
                            }
                          }}
                        />
                        {imageFile && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <ImageIcon className="h-4 w-4" />
                            {imageFile.name} uploaded successfully
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Choices */}
                  <div className="space-y-3">
                    <Label>Answer Choices</Label>
                    {currentQuestion.choices.map((choice, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Choice ${String.fromCharCode(65 + index)}`}
                          value={choice}
                          onChange={(e) => {
                            const newChoices = [...currentQuestion.choices];
                            newChoices[index] = e.target.value;
                            setCurrentQuestion({
                              ...currentQuestion,
                              choices: newChoices
                            });
                          }}
                        />
                        <Button
                          type="button"
                          variant={currentQuestion.correct === choice ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentQuestion({
                            ...currentQuestion,
                            correct: choice
                          })}
                          disabled={!choice.trim()}
                        >
                          Correct
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={addQuestion}
                    className="w-full"
                    disabled={!currentQuestion.prompt.trim() || !currentQuestion.topic}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
                {questions.length > 0 && (
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    Save All Questions
                  </Button>
                )}
              </div>

              {questions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No questions added yet</p>
                    <p className="text-sm text-gray-400">Add your first question using the form on the left</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Q{index + 1}</Badge>
                              <Badge>{question.topic}</Badge>
                              <Badge variant="secondary">{question.difficulty}</Badge>
                              <Badge variant="outline">{question.timeLimit}s</Badge>
                            </div>
                            <p className="text-sm font-medium mb-2">{question.prompt}</p>
                            {question.imageUrl && (
                              <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                                <ImageIcon className="h-3 w-3" />
                                Image attached
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              Correct: {question.correct}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 