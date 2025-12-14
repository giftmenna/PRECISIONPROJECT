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
  Clock,
  Gem,
  Eye
} from "lucide-react";
import { GRADE_OPTIONS } from "@/lib/grade-constants";

interface TestQuestion {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  gemReward: number;
  timeLimit?: number;
  createdAt: string;
  imageUrl?: string;
}

export default function AdminTestQuestionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateMultipleModal, setShowCreateMultipleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<TestQuestion | null>(null);
  const [showAddMoreButton, setShowAddMoreButton] = useState(false);
  const [multipleQuestions, setMultipleQuestions] = useState([
    {
      question: "",
      answer: "",
      explanation: "",
      topic: "",
      difficulty: "MEDIUM" as 'EASY' | 'MEDIUM' | 'HARD',
      gemReward: 0,
      timeLimit: 0,
      imageUrl: "",
      hasGemReward: false
    }
  ]);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    explanation: "",
    topic: "",
    difficulty: "MEDIUM" as 'EASY' | 'MEDIUM' | 'HARD',
    gemReward: 0,
    timeLimit: 0,
    imageUrl: "",
    hasGemReward: false
  });

    useEffect(() => {
    if (status === "loading") return;

    if (session && (session.user as any).role?.toLowerCase() === "admin") {
      fetchQuestions();
    }
  }, [session, status]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/admin/questions?type=test");
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
      // Prepare the data for API - only send gemReward if hasGemReward is true
      const apiData = {
        ...formData,
        gemReward: formData.hasGemReward ? Number(formData.gemReward) : 0,
        type: "test"
      };
      
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setShowAddMoreButton(true);
        setFormData({
          question: "",
          answer: "",
          explanation: "",
          topic: "",
          difficulty: "MEDIUM",
          gemReward: 0,
          timeLimit: 0,
          imageUrl: "",
          hasGemReward: false
        });
        fetchQuestions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create question");
      }
    } catch (error) {
      console.error("Error creating question:", error);
      alert(`Error creating question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditQuestion = async () => {
    if (!selectedQuestion) return;

    try {
      // Prepare the data for API - only send gemReward if hasGemReward is true
      const apiData = {
        ...formData,
        gemReward: formData.hasGemReward ? Number(formData.gemReward) : 0,
        type: "test"
      };
      
      const response = await fetch(`/api/admin/questions/${selectedQuestion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData)
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedQuestion(null);
        setFormData({
          question: "",
          answer: "",
          explanation: "",
          topic: "",
          difficulty: "MEDIUM",
          gemReward: 0,
          timeLimit: 0,
          imageUrl: "",
          hasGemReward: false
        });
        fetchQuestions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update question");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      alert(`Error updating question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        fetchQuestions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert(`Error deleting question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAddMoreQuestions = () => {
    setShowCreateModal(true);
    setShowAddMoreButton(false);
  };

  const handleCreateMultipleQuestions = async () => {
    try {
      const validQuestions = multipleQuestions.filter(q => q.question.trim() && q.answer.trim());
      
      if (validQuestions.length === 0) {
        alert('Please add at least one valid question');
        return;
      }

      for (const questionData of validQuestions) {
        const apiData = {
          ...questionData,
          gemReward: questionData.hasGemReward ? Number(questionData.gemReward) : 0,
          type: "test"
        };
        
        const response = await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create question");
        }
      }

      setShowCreateMultipleModal(false);
      setMultipleQuestions([{
        question: "",
        answer: "",
        explanation: "",
        topic: "",
        difficulty: "MEDIUM",
        gemReward: 0,
        timeLimit: 0,
        imageUrl: "",
        hasGemReward: false
      }]);
      fetchQuestions();
      alert(`Successfully created ${validQuestions.length} questions!`);
    } catch (error) {
      console.error("Error creating multiple questions:", error);
      alert(`Error creating questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addQuestionField = () => {
    setMultipleQuestions([...multipleQuestions, {
      question: "",
      answer: "",
      explanation: "",
      topic: "",
      difficulty: "MEDIUM",
      gemReward: 0,
      timeLimit: 0,
      imageUrl: "",
      hasGemReward: false
    }]);
  };

  const removeQuestionField = (index: number) => {
    if (multipleQuestions.length > 1) {
      setMultipleQuestions(multipleQuestions.filter((_, i) => i !== index));
    }
  };

  const updateMultipleQuestion = (index: number, field: string, value: any) => {
    const updated = [...multipleQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setMultipleQuestions(updated);
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = (question.question?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (question.topic?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesTopic = !selectedTopic || question.topic === selectedTopic;
    const matchesDifficulty = !selectedDifficulty || question.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  const topics = [...new Set(questions.map(q => q.topic))];

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Show unauthorized message if not admin
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

  if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">Access denied</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Test Questions</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage questions for test competitions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => router.push('/admin/dashboard')}
            variant="outline"
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            ← Back to Dashboard
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create Question</span>
            <span className="sm:hidden">Create</span>
          </Button>
          <Button 
            onClick={() => setShowCreateMultipleModal(true)}
            variant="outline"
            className="text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create Multiple</span>
            <span className="sm:hidden">Multiple</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
          >
            <option value="">All Topics</option>
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-8">Loading questions...</div>
      ) : filteredQuestions.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Test Questions</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first test question to get started.</p>
            <Button onClick={() => setShowCreateModal(true)} className="text-xs sm:text-sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Question</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {filteredQuestions.map((question) => (
            <Card key={question.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={question.difficulty === 'EASY' ? 'default' : question.difficulty === 'MEDIUM' ? 'secondary' : 'destructive'}>
                        {question.difficulty}
                      </Badge>
                      <Badge variant="outline">{question.topic}</Badge>
                      {question.gemReward > 0 && (
                        <Badge variant="outline" className="text-yellow-600">
                          <Gem className="h-3 w-3 mr-1" />
                          {question.gemReward}
                        </Badge>
                      )}
                      {question.timeLimit && question.timeLimit > 0 && (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {question.timeLimit}s
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{question.question}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Answer: {question.answer}
                    </p>
                    {question.imageUrl && (
                      <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                        🖼️ Image: {question.imageUrl}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQuestion(question);
                        setFormData({
                          question: question.question,
                          answer: question.answer,
                          explanation: question.explanation,
                          topic: question.topic,
                          difficulty: question.difficulty,
                          gemReward: question.gemReward,
                          timeLimit: question.timeLimit || 0,
                          imageUrl: question.imageUrl || "",
                          hasGemReward: question.gemReward > 0
                        });
                        setShowEditModal(true);
                      }}
                      className="text-xs"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-xs"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
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
                      Would you like to add more questions to this test?
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

      {/* Create Question Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Test Question</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  placeholder="Enter the question"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Answer</label>
                <Input
                  value={formData.answer}
                  onChange={(e) => setFormData({...formData, answer: e.target.value})}
                  placeholder="Enter the answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Explanation</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                  placeholder="Enter explanation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Topic</label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="e.g., Algebra, Geometry"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value as 'EASY' | 'MEDIUM' | 'HARD'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gem Reward</label>
                  <Input
                    type="number"
                    step="0.00001"
                    value={formData.gemReward}
                    onChange={(e) => setFormData({...formData, gemReward: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="Image URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                <Input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({...formData, timeLimit: Number(e.target.value)})}
                  placeholder="0 (no limit)"
                />
                <p className="text-xs text-gray-500 mt-1">Leave as 0 for no time limit</p>
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

      {/* Edit Question Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Test Question</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  placeholder="Enter the question"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Answer</label>
                <Input
                  value={formData.answer}
                  onChange={(e) => setFormData({...formData, answer: e.target.value})}
                  placeholder="Enter the answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Explanation</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                  placeholder="Enter explanation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Topic</label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="e.g., Algebra, Geometry"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value as 'EASY' | 'MEDIUM' | 'HARD'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gem Reward</label>
                  <Input
                    type="number"
                    step="0.00001"
                    value={formData.gemReward}
                    onChange={(e) => setFormData({...formData, gemReward: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="Image URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                <Input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({...formData, timeLimit: Number(e.target.value)})}
                  placeholder="0 (no limit)"
                />
                <p className="text-xs text-gray-500 mt-1">Leave as 0 for no time limit</p>
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

      {/* Create Multiple Questions Modal */}
      {showCreateMultipleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Multiple Test Questions</h2>
            <div className="space-y-6">
              {multipleQuestions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Question {index + 1}</h3>
                    {multipleQuestions.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestionField(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Question</label>
                      <textarea
                        value={question.question}
                        onChange={(e) => updateMultipleQuestion(index, 'question', e.target.value)}
                        placeholder="Enter the question"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Answer</label>
                      <Input
                        value={question.answer}
                        onChange={(e) => updateMultipleQuestion(index, 'answer', e.target.value)}
                        placeholder="Enter the answer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Explanation</label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) => updateMultipleQuestion(index, 'explanation', e.target.value)}
                        placeholder="Enter explanation"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Topic</label>
                      <Input
                        value={question.topic}
                        onChange={(e) => updateMultipleQuestion(index, 'topic', e.target.value)}
                        placeholder="e.g., Algebra, Geometry"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Difficulty</label>
                        <select
                          value={question.difficulty}
                          onChange={(e) => updateMultipleQuestion(index, 'difficulty', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HARD">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Gem Reward</label>
                        <Input
                          type="number"
                          step="0.00001"
                          value={question.gemReward}
                          onChange={(e) => updateMultipleQuestion(index, 'gemReward', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                      <Input
                        value={question.imageUrl}
                        onChange={(e) => updateMultipleQuestion(index, 'imageUrl', e.target.value)}
                        placeholder="Image URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                      <Input
                        type="number"
                        value={question.timeLimit}
                        onChange={(e) => updateMultipleQuestion(index, 'timeLimit', Number(e.target.value))}
                        placeholder="0 (no limit)"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-center">
                <Button
                  onClick={addQuestionField}
                  variant="outline"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Question
                </Button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateMultipleModal(false)} className="flex-1 text-xs sm:text-sm">
                Cancel
              </Button>
              <Button onClick={handleCreateMultipleQuestions} className="flex-1 text-xs sm:text-sm">
                Create {multipleQuestions.length} Question{multipleQuestions.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 