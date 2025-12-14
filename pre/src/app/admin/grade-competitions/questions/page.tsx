"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, GraduationCap } from 'lucide-react';
import { GRADE_OPTIONS } from '@/lib/grade-constants';

interface Question {
  id: string;
  prompt: string;
  topic: string;
  difficulty: string;
  choices: string[];
  correct: string;
  imageUrl?: string;
  timeLimit?: number;
  position: number;
  createdAt: string;
  gemReward?: number;
  requiredGrade?: string;
}

export default function GradeCompetitionQuestionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAddMoreButton, setShowAddMoreButton] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    prompt: '',
    topic: '',
    difficulty: 'EASY',
    choices: ['', '', '', ''],
    correct: '',
    imageUrl: '',
    timeLimit: 60,
    competitionId: '',
    gemReward: 0,
    hasGemReward: false,
    requiredGrade: ''
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
      router.push("/auth/login");
      return;
    }

    fetchQuestions();
  }, [session, status, router]);

  useEffect(() => {
    // Extract unique topics from questions
    const uniqueTopics = [...new Set(questions.map(q => q.topic).filter(Boolean))];
    setTopics(uniqueTopics);
  }, [questions]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/grade-competitions/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        // If the API returns an error, set empty array instead of showing error
        console.log('API returned error, setting empty questions array');
        setQuestions([]);
      }
    } catch (error) {
      // If there's a network error, set empty array instead of showing error
      console.log('Network error, setting empty questions array');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      // Prepare the data for API - only send gemReward if hasGemReward is true
      const apiData = {
        ...formData,
        gemReward: formData.hasGemReward ? Number(formData.gemReward) : 0
      };
      
      const response = await fetch('/api/admin/grade-competitions/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          prompt: '',
          topic: '',
          difficulty: 'EASY',
          choices: ['', '', '', ''],
          correct: '',
          imageUrl: '',
          timeLimit: 60,
          competitionId: '',
          gemReward: 0,
          hasGemReward: false,
          requiredGrade: ''
        });
        setShowAddMoreButton(true);
        fetchQuestions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      alert(`Error creating question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion) return;

    try {
      // Prepare the data for API - only send gemReward if hasGemReward is true
      const apiData = {
        ...formData,
        gemReward: formData.hasGemReward ? Number(formData.gemReward) : 0
      };
      
      const response = await fetch(`/api/admin/grade-competitions/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingQuestion(null);
        setFormData({
          prompt: '',
          topic: '',
          difficulty: 'EASY',
          choices: ['', '', '', ''],
          correct: '',
          imageUrl: '',
          timeLimit: 60,
          competitionId: '',
          gemReward: 0,
          hasGemReward: false,
          requiredGrade: ''
        });
        fetchQuestions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert(`Error updating question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/admin/grade-competitions/questions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchQuestions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      prompt: question.prompt,
      topic: question.topic,
      difficulty: question.difficulty,
      choices: [...question.choices],
      correct: question.correct,
      imageUrl: question.imageUrl || '',
      timeLimit: question.timeLimit || 60,
      competitionId: '',
      gemReward: question.gemReward || 0,
      hasGemReward: (question.gemReward || 0) > 0,
      requiredGrade: question.requiredGrade || ''
    });
    setShowEditModal(true);
  };

  const handleAddMoreQuestions = () => {
    setShowAddMoreButton(false);
    setShowCreateModal(true);
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = (question.prompt?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (question.topic?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || question.topic === selectedTopic;
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'HARD': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">Access denied. Please log in as admin.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Grade Competition Questions
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manage questions for grade-specific competitions and assessments.
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
                placeholder="Search grade competition questions..."
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
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Grade Competition Questions Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {questions.length === 0 
                  ? "Create your first grade competition question to get started." 
                  : "No questions match your current filters."}
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="text-xs sm:text-sm">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Create Grade Question</span>
                <span className="sm:hidden">Create Question</span>
              </Button>
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
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {question.prompt}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {question.topic}
                          </Badge>
                          <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </Badge>
                        </div>
                        {question.imageUrl && (
                          <div className="mb-2">
                            <img 
                              src={question.imageUrl} 
                              alt="Question" 
                              className="w-full h-32 object-cover rounded-md"
                            />
                          </div>
                        )}
                        {question.timeLimit && question.timeLimit > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ⏱️ Time Limit: {question.timeLimit}s
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {question.choices.map((choice, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className={question.correct === String.fromCharCode(65 + index) ? 'font-semibold text-green-600 dark:text-green-400' : ''}>
                            {choice}
                          </span>
                          {question.correct === String.fromCharCode(65 + index) && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                              Correct
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(question)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
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
                    <div className="text-green-600 dark:text-green-400 mb-2">
                      ✅ Question created successfully!
                    </div>
                    <Button onClick={handleAddMoreQuestions}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add More Questions
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Create Grade Competition Question</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Question</label>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                    placeholder="Enter your grade competition question..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    value={formData.gemReward}
                    onChange={(e) => setFormData({...formData, gemReward: Number(e.target.value)})}
                    disabled={!formData.hasGemReward}
                    placeholder="0.00001"
                  />
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
              <h2 className="text-xl font-bold mb-4">Edit Grade Competition Question</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Question</label>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                    placeholder="Enter your grade competition question..."
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
                    value={formData.gemReward}
                    onChange={(e) => setFormData({...formData, gemReward: Number(e.target.value)})}
                    disabled={!formData.hasGemReward}
                    placeholder="0.00001"
                  />
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
    </div>
  );
} 