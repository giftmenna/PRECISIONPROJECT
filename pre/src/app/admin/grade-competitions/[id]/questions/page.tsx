"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  FileText,
  Image,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Question {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  topic: string;
  difficulty: string;
  imageUrl?: string;
  position: number;
}

interface Competition {
  id: string;
  name: string;
  description: string;
  grade: string;
  entryFee: number;
  status: string;
  startsAt: string;
  endsAt: string;
}

export default function GradeCompetitionQuestionsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    prompt: "",
    choices: ["", "", "", ""],
    correct: "",
    topic: "",
    difficulty: "MEDIUM",
    imageUrl: ""
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      router.push("/auth/login");
      return;
    }

    fetchCompetition();
    fetchQuestions();
  }, [session, status, router, params.id]);

  const fetchCompetition = async () => {
    try {
      const response = await fetch(`/api/admin/grade-competitions/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setCompetition(data.competition);
      }
    } catch (error) {
      console.error("Error fetching competition:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/admin/grade-competitions/${params.id}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    try {
      const response = await fetch(`/api/admin/grade-competitions/${params.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to add question");

      setShowAddModal(false);
      setFormData({
        prompt: "",
        choices: ["", "", "", ""],
        correct: "",
        topic: "",
        difficulty: "MEDIUM",
        imageUrl: ""
      });
      fetchQuestions();
      toast({
        title: "Success",
        description: "Question added successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/grade-competitions/${params.id}/questions/${questionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error("Failed to delete question");

      fetchQuestions();
      toast({
        title: "Success",
        description: "Question deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any).role !== "admin") {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/grade-competitions">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Grade Competitions
              </Button>
            </Link>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
        
        {competition && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {competition.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {competition.description}
            </p>
            <div className="flex gap-4 text-sm">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                Grade: {competition.grade}
              </Badge>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Status: {competition.status}
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                Entry Fee: {competition.entryFee} gems
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Questions ({questions.length}) - Unlimited questions supported</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Questions Added</h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4">Start by adding questions for this grade competition.</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id} className="border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Question {index + 1}</h3>
                      <div className="flex gap-2">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {question.topic}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          {question.difficulty}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Question</label>
                        <p className="text-gray-700 dark:text-gray-300">{question.prompt}</p>
                        {question.imageUrl && (
                          <div className="mt-2">
                            <Image className="h-4 w-4 inline mr-1" />
                            <span className="text-sm text-gray-500">Image attached</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Choices</label>
                        <div className="space-y-1">
                          {question.choices.map((choice, choiceIndex) => (
                            <div key={choiceIndex} className="flex items-center gap-2">
                              <span className="text-sm font-medium">{String.fromCharCode(65 + choiceIndex)}.</span>
                              <span className={`text-sm ${choice === question.correct ? 'text-green-600 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                                {choice}
                              </span>
                              {choice === question.correct && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Question</h2>
              <Button
                variant="ghost"
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="Enter the question..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Topic</label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., Algebra, Geometry, Arithmetic"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Choices</label>
                {formData.choices.map((choice, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium w-6">{String.fromCharCode(65 + index)}.</span>
                    <Input
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...formData.choices];
                        newChoices[index] = e.target.value;
                        setFormData({ ...formData, choices: newChoices });
                      }}
                      placeholder={`Choice ${String.fromCharCode(65 + index)}`}
                    />
                    <input
                      type="radio"
                      name="correct"
                      value={choice}
                      checked={formData.correct === choice}
                      onChange={(e) => setFormData({ ...formData, correct: e.target.value })}
                      className="ml-2"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAddQuestion} 
                  className="flex-1"
                  disabled={!formData.prompt || !formData.topic || !formData.correct || formData.choices.some(c => !c)}
                >
                  Add Question
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 