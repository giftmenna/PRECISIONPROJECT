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
  Search, 
  BookOpen,
  Target,
  Zap,
  CheckCircle,
  School
} from "lucide-react";
import { GRADE_OPTIONS } from "@/lib/grade-constants";

interface Question {
  id: string;
  prompt: string;
  choices: any;
  correct: string;
  topic: string;
  difficulty: string;
  explanation?: string;
  imageUrl?: string;
  questionType: string;
  timeLimit: number;
  isActive: boolean;
  requiredGrade?: string;
  requiredGems: number;
  createdAt: string;
}

export default function ExamQuestionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAddMoreButton, setShowAddMoreButton] = useState(false);
  const [formData, setFormData] = useState({
    prompt: "",
    choices: ["", "", "", ""],
    correct: "",
    topic: "",
    difficulty: "MEDIUM",
    explanation: "",
    timeLimit: 60,
    imageUrl: "",
    questionType: "multiple_choice",
    isActive: false,
    requiredGrade: "",
    hasGemReward: false,
    requiredGems: 0
  });

  useEffect(() => {
    if (status === "loading") return;

    if (session && (session.user as any).role?.toLowerCase() === "admin") {
      fetchQuestions();
    }
  }, [session, status]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/questions');
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

  const handleCreateQuestion = async () => {
    try {
      // Prepare the data for API - only send requiredGems if hasGemReward is true
      const apiData = {
        ...formData,
        requiredGems: formData.hasGemReward ? Number(formData.requiredGems) : 0
      };
      
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create question");
      }

      setShowCreateModal(false);
      setShowAddMoreButton(true);
      setFormData({
        prompt: "",
        choices: ["", "", "", ""],
        correct: "",
        topic: "",
        difficulty: "MEDIUM",
        explanation: "",
        timeLimit: 60,
        imageUrl: "",
        questionType: "multiple_choice",
        isActive: false,
        requiredGrade: "",
        hasGemReward: false,
        requiredGems: 0
      });
      fetchQuestions();
    } catch (error) {
      console.error("Error creating question:", error);
      alert(`Error creating question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditQuestion = async () => {
    if (!selectedQuestion) return;

    try {
      // Prepare the data for API - only send requiredGems if hasGemReward is true
      const apiData = {
        ...formData,
        requiredGems: formData.hasGemReward ? Number(formData.requiredGems) : 0
      };
      
      const response = await fetch(`/api/admin/questions/${selectedQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update question");
      }

      setShowEditModal(false);
      fetchQuestions();
    } catch (error) {
      console.error("Error updating question:", error);
      alert(`Error updating question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAddMoreQuestions = () => {
    setShowCreateModal(true);
    setShowAddMoreButton(false);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete question");
      }

      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      alert(`Error deleting question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleToggleActivation = async (questionId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) throw new Error("Failed to toggle question status");

      fetchQuestions();
    } catch (error) {
      console.error("Error toggling question status:", error);
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

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return <CheckCircle className="h-4 w-4" />;
      case 'MEDIUM': return <Target className="h-4 w-4" />;
      case 'HARD': return <Zap className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get unique topics for filter
  const topics = Array.from(new Set(questions.map(q => q.topic))).sort();

  // Filter questions
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = (question.prompt?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (question.topic?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === "all" || question.topic === selectedTopic;
    const matchesDifficulty = selectedDifficulty === "all" || question.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-4">
                You need to be logged in as an administrator to access this page.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Admin Login:</strong><br />
                  Email: admin@precisionaw.com<br />
                  Password: admin123
                </p>
              </div>
              <Button onClick={() => router.push('/auth/login')}>
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Exam Questions
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manage questions for comprehensive exams and assessments.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => router.push('/admin/competitions')}
                variant="outline"
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                ← Go Back
              </Button>
              <Button 
                onClick={fetchQuestions}
                variant="outline"
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                🔄 Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search exam questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 text-xs sm:text-sm"
              >
                <option value="all">All Topics</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 text-xs sm:text-sm"
              >
                <option value="all">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs sm:text-sm w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create Exam Question</span>
            <span className="sm:hidden">Create Question</span>
          </Button>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Exam Questions Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {questions.length === 0 
                  ? "Create your first exam question to get started." 
                  : "No questions match your current filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredQuestions.map((question) => (
              <Card key={question.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{question.prompt}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {getDifficultyIcon(question.difficulty)}
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {question.topic}
                        </Badge>
                        <Badge variant={question.isActive ? "default" : "secondary"}>
                          {question.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(question.choices).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            key === question.correct 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {key}
                          </span>
                          <span className="text-sm truncate">{value as string}</span>
                        </div>
                      ))}
                    </div>
                    {question.imageUrl && (
                      <div className="text-sm text-purple-600 dark:text-purple-400">
                        🖼️ Image: {question.imageUrl}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Created: {formatDateTime(question.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQuestion(question);
                        setFormData({
                          prompt: question.prompt,
                          choices: Object.values(question.choices),
                          correct: question.correct,
                          topic: question.topic,
                          difficulty: question.difficulty,
                          explanation: question.explanation || "",
                          timeLimit: question.timeLimit,
                          imageUrl: question.imageUrl || "",
                          questionType: question.questionType,
                          isActive: question.isActive,
                          requiredGrade: question.requiredGrade || "",
                          hasGemReward: question.requiredGems > 0,
                          requiredGems: question.requiredGems
                        });
                        setShowEditModal(true);
                      }}
                      className="text-xs"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                    <Button
                      variant={question.isActive ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleActivation(question.id, question.isActive)}
                      title={question.isActive ? "Deactivate question" : "Activate question"}
                      className="text-xs"
                    >
                      <span className="hidden sm:inline">{question.isActive ? "Active" : "Inactive"}</span>
                      <span className="sm:hidden">{question.isActive ? "On" : "Off"}</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-xs"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Delete</span>
                      <span className="sm:hidden">Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Add More Questions Button */}
          {showAddMoreButton && (
            <div className="mt-8 text-center">
              <Card className="inline-block">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Question Created Successfully! 🎉
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Would you like to add more questions to this exam?
                      </p>
                    </div>
                    <Button onClick={handleAddMoreQuestions} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add More Questions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Create Exam Question</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Question</label>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                    placeholder="Enter your exam question..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Topic</label>
                    <Input
                      value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      placeholder="e.g., Algebra, Geometry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Choices</label>
                  <div className="space-y-2">
                    {formData.choices.map((choice, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <Input
                          value={choice}
                          onChange={(e) => {
                            const newChoices = [...formData.choices];
                            newChoices[index] = e.target.value;
                            setFormData({...formData, choices: newChoices});
                          }}
                          placeholder={`Choice ${String.fromCharCode(65 + index)}`}
                        />
                        <input
                          type="radio"
                          name="correct"
                          value={String.fromCharCode(65 + index)}
                          checked={formData.correct === String.fromCharCode(65 + index)}
                          onChange={(e) => setFormData({...formData, correct: e.target.value})}
                          className="ml-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Explanation (Optional)</label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                    placeholder="Explain the solution..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                  <div>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                    >
                      {GRADE_OPTIONS.map((grade) => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                      <Input
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        placeholder="Image URL"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="YouTube video URL"
                      />
                    </div>
                  </div>                    <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                    <Input
                      type="number"
                      value={formData.timeLimit}
                      onChange={(e) => setFormData({...formData, timeLimit: Number(e.target.value)})}
                      min="30"
                      max="300"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.hasGemReward}
                        onChange={(e) => setFormData({...formData, hasGemReward: e.target.checked})}
                        className="ml-2"
                      />
                      <label className="text-sm font-medium">Enable Gem Reward</label>
                    </div>
                    <Input
                      type="number"
                      step="0.00001"
                      value={formData.requiredGems}
                      onChange={(e) => setFormData({...formData, requiredGems: Number(e.target.value)})}
                      disabled={!formData.hasGemReward}
                      placeholder="0.00001"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1 text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button onClick={handleCreateQuestion} className="flex-1 text-xs sm:text-sm">
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Exam Question</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Question</label>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                    placeholder="Enter your exam question..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Topic</label>
                    <Input
                      value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      placeholder="e.g., Algebra, Geometry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Choices</label>
                  <div className="space-y-2">
                    {formData.choices.map((choice, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <Input
                          value={choice}
                          onChange={(e) => {
                            const newChoices = [...formData.choices];
                            newChoices[index] = e.target.value;
                            setFormData({...formData, choices: newChoices});
                          }}
                          placeholder={`Choice ${String.fromCharCode(65 + index)}`}
                        />
                        <input
                          type="radio"
                          name="correct"
                          value={String.fromCharCode(65 + index)}
                          checked={formData.correct === String.fromCharCode(65 + index)}
                          onChange={(e) => setFormData({...formData, correct: e.target.value})}
                          className="ml-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Explanation (Optional)</label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                    placeholder="Explain the solution..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                    rows={2}
                  />
                </div>
                  <div>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                    >
                      {GRADE_OPTIONS.map((grade) => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                      <Input
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        placeholder="Image URL"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="YouTube video URL"
                      />
                    </div>
                  </div>                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                    <Input
                      type="number"
                      value={formData.timeLimit}
                      onChange={(e) => setFormData({...formData, timeLimit: Number(e.target.value)})}
                      min="30"
                      max="300"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.hasGemReward}
                        onChange={(e) => setFormData({...formData, hasGemReward: e.target.checked})}
                        className="ml-2"
                      />
                      <label className="text-sm font-medium">Enable Gem Reward</label>
                    </div>
                    <Input
                      type="number"
                      step="0.00001"
                      value={formData.requiredGems}
                      onChange={(e) => setFormData({...formData, requiredGems: Number(e.target.value)})}
                      disabled={!formData.hasGemReward}
                      placeholder="0.00001"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1 text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button onClick={handleEditQuestion} className="flex-1 text-xs sm:text-sm">
                  Update
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 