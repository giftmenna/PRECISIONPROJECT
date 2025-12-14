"use client";

import { useState, useEffect, use } from "react";
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
  CheckCircle,
  Clock,
  Trophy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { TOPICS } from "@/lib/topics";

interface Question {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  topic: string;
  difficulty: string;
  imageUrl?: string;
  position: number;
  timeLimit?: number;
  isActive?: boolean;
  requiredGrade?: string;
  requiredGems?: number;
}

interface Competition {
  id: string;
  name: string;
  description: string;
  status: string;
  startsAt: string;
  endsAt: string;
  entryType: 'FREE' | 'PAID';
  entryPriceGem: number;
  prizeCashNgn: number;
  timeLimit?: number;
}

export default function CompetitionQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
    imageUrl: "",
    timeLimit: 60,
    isActive: false,
    requiredGrade: "",
    requiredGems: 0
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      router.push("/auth/login");
      return;
    }

    fetchCompetition();
    fetchQuestions();
  }, [session, status, router, id]);

  const fetchCompetition = async () => {
    try {
      const response = await fetch(`/api/admin/competitions/${id}`);
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
      const response = await fetch(`/api/admin/competitions/${id}/questions`);
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
      const response = await fetch(`/api/admin/competitions/${id}/questions`, {
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
        imageUrl: "",
        timeLimit: 60,
        isActive: false,
        requiredGrade: "",
        requiredGems: 0
      });
      fetchQuestions();
      toast({
        title: "Success",
        description: "Question added successfully",
      });
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await fetch(`/api/admin/competitions/${id}/questions/${questionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error("Failed to delete question");

      fetchQuestions();
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleToggleActivation = async (questionId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/competitions/${id}/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (!response.ok) throw new Error("Failed to toggle question activation");

      fetchQuestions();
      toast({
        title: "Success",
        description: `Question ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error("Error toggling question activation:", error);
      toast({
        title: "Error",
        description: "Failed to toggle question activation",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'HARD': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link href="/admin/competitions">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Competitions</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Competition Questions
              </h1>
              {competition && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {competition.name} • {questions.length} questions
                </p>
              )}
            </div>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs sm:text-sm w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Question</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Competition Info */}
        {competition && (
          <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Competition Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {competition.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Time: {Math.floor((competition.timeLimit || 1800) / 60)} min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Status: {competition.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        {questions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Questions</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Add questions to this competition to get started.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Question
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {questions.map((question, index) => (
              <Card key={question.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline" className="truncate max-w-24">
                          {question.topic}
                        </Badge>
                        {question.isActive ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white break-words">
                        {question.prompt}
                      </p>
                      {question.imageUrl && (
                        <div className="mt-2">
                          <Image className="h-4 w-4 inline mr-1 text-gray-500" />
                          <span className="text-sm text-gray-500">Image attached</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {question.choices.map((choice, choiceIndex) => (
                      <div
                        key={choiceIndex}
                        className={`p-2 rounded border ${
                          choice === question.correct
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
                            : 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
                        }`}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + choiceIndex)}:
                        </span>
                        {choice}
                        {choice === question.correct && (
                          <CheckCircle className="h-4 w-4 text-green-600 inline ml-2" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>Time: {question.timeLimit || 60}s</span>
                      {question.requiredGrade && (
                        <span>Grade: {question.requiredGrade}</span>
                      )}
                      {(question.requiredGems || 0) > 0 && (
                        <span>Gems: {question.requiredGems || 0}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActivation(question.id, question.isActive || false)}
                        className="text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">{question.isActive ? 'Deactivate' : 'Activate'}</span>
                        <span className="sm:hidden">{question.isActive ? 'Deact' : 'Act'}</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-xs sm:text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Question Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add Question</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Question</label>
                  <Input
                    value={formData.prompt}
                    onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                    placeholder="Enter the question..."
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Topic</label>
                    <select
                      value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select a topic</option>
                      {TOPICS.map((topic) => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                    <Input
                      type="number"
                      min="30"
                      max="600"
                      value={formData.timeLimit}
                      onChange={(e) => setFormData({...formData, timeLimit: Number(e.target.value)})}
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Required Gems</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.requiredGems}
                      onChange={(e) => setFormData({...formData, requiredGems: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Choices</label>
                  <div className="space-y-2">
                    {formData.choices.map((choice, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium w-8">{String.fromCharCode(65 + index)}:</span>
                          <Input
                            value={choice}
                            onChange={(e) => {
                              const newChoices = [...formData.choices];
                              newChoices[index] = e.target.value;
                              setFormData({...formData, choices: newChoices});
                            }}
                            placeholder={`Choice ${String.fromCharCode(65 + index)}`}
                            className="flex-1"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct"
                            value={choice}
                            checked={formData.correct === choice}
                            onChange={(e) => setFormData({...formData, correct: e.target.value})}
                            className="ml-2"
                          />
                          <span className="text-sm text-gray-500">Correct</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Activate question immediately
                  </label>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button onClick={handleAddQuestion} className="flex-1 text-xs sm:text-sm">
                  Add Question
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 