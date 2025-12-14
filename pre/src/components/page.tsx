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
  XCircle
} from "lucide-react";

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

export default function CompetitionQuestionsPage() {
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

    console.log("Session status:", status);
    console.log("Session data:", session);
    console.log("User role:", session?.user ? (session.user as any).role : "No user");

    if (session && (session.user as any).role?.toLowerCase() === "admin") {
      console.log("Authorized, fetching questions");
      fetchQuestions();
    }
  }, [session, status]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/questions');
      console.log("Fetch questions response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch questions:", errorData);
        alert(`Failed to fetch questions: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert(`Network error fetching questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setFormData({
      prompt: question.prompt,
      choices: question.choices || ["", "", "", ""],
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
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = (question.prompt?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (question.topic?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === "all" || question.topic === selectedTopic;
    const matchesDifficulty = selectedDifficulty === "all" || question.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  const topics = Array.from(new Set(questions.map(q => q.topic))).filter(Boolean);
  const difficulties = Array.from(new Set(questions.map(q => q.difficulty))).filter(Boolean);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Debug info for development
  if (process.env.NODE_ENV === 'development') {
    console.log("Current session:", session);
    console.log("User role:", session?.user ? (session.user as any).role : "No user");
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <strong>Debug Info:</strong> Status: {status} | 
          User: {session?.user?.email || 'None'} | 
          Role: {session?.user ? (session.user as any).role : 'None'}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Weekly Competition Questions</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage questions for weekly competitions</p>
        </div>
        <Button onClick={() => router.push('/admin/competitions')}>
          Go Back
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="all">All Topics</option>
            <option value="arithmetic:addition">Arithmetic: Addition</option>
            <option value="arithmetic:subtraction">Arithmetic: Subtraction</option>
            <option value="arithmetic:multiplication">Arithmetic: Multiplication</option>
            <option value="arithmetic:division">Arithmetic: Division</option>
            <option value="fractions">Fractions</option>
            <option value="percentages">Percentages</option>
            <option value="ratios">Ratios</option>
            <option value="linear_algebra_basics">Linear Algebra Basics</option>
            <option value="geometry_basics">Geometry Basics</option>
            <option value="quadratics">Quadratics</option>
            <option value="functions">Functions</option>
            <option value="probability">Probability</option>
            <option value="statistics:advanced">Statistics: Advanced</option>
            <option value="calculus:limits">Calculus: Limits</option>
            <option value="calculus:derivatives">Calculus: Derivatives</option>
            <option value="calculus:integrals">Calculus: Integrals</option>
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="all">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-8">Loading questions...</div>
      ) : filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No questions found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || selectedTopic !== "all" || selectedDifficulty !== "all" 
                ? "Try adjusting your search or filters" 
                : "Get started by creating your first question"}
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredQuestions.map((question) => (
            <Card key={question.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{question.prompt}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">{question.topic}</Badge>
                      <Badge variant={question.difficulty === 'EASY' ? 'default' : question.difficulty === 'MEDIUM' ? 'secondary' : 'destructive'}>
                        {question.difficulty}
                      </Badge>
                      {question.isActive && <Badge variant="outline" className="text-green-600">Active</Badge>}
                    </div>
                    {question.imageUrl && (
                      <div className="mb-3">
                        <img src={question.imageUrl} alt="Question" className="max-w-xs rounded" />
                      </div>
                    )}
                    <div className="space-y-2">
                      {question.choices && question.choices.map((choice: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className={choice === question.correct ? "font-semibold text-green-600" : ""}>
                            {choice}
                          </span>
                          {choice === question.correct && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(question)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteQuestion(question.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Time: {question.timeLimit}s</span>
                  {question.requiredGrade && <span>Grade: {question.requiredGrade}</span>}
                  {question.requiredGems > 0 && <span>Gems: {question.requiredGems}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add More Questions Button */}
      {showAddMoreButton && (
        <div className="mt-6 text-center">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <p className="text-green-800 dark:text-green-200">Question created successfully!</p>
          </div>
          <Button onClick={handleAddMoreQuestions}>
            <Plus className="w-4 h-4 mr-2" />
            Add More Questions
          </Button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Question</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                  placeholder="Enter your question..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                        checked={formData.correct === choice}
                        onChange={() => setFormData({...formData, correct: choice})}
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
                <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="Image URL"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateQuestion} className="flex-1">
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Question</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                  placeholder="Enter your question..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                        checked={formData.correct === choice}
                        onChange={() => setFormData({...formData, correct: choice})}
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
                <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="Image URL"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleEditQuestion} className="flex-1">
                Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
