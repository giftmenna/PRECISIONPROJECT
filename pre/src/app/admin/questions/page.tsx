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
  Filter,
  Eye,
  EyeOff
} from "lucide-react";

interface Question {
  id: string;
  prompt: string;
  choices: any;
  correctChoice: string;
  topic: string;
  difficulty: string;
  explanation?: string;
  imageUrl?: string;
  timeLimit: number;
  gems: number;
  isActive: boolean;
  source?: string;
  createdAt: string;
}

export default function AdminQuestionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedSource, setSelectedSource] = useState("");

  // Check authentication and admin role
  useEffect(() => {
    console.log("Questions Page - Status:", status);
    console.log("Questions Page - Session:", session);
    console.log("Questions Page - User Role:", (session?.user as any)?.role);
    
    if (status === "loading") return; // Wait for session to load
    
    if (status === "unauthenticated") {
      console.log("Questions Page - Redirecting to login");
      router.push("/auth/login");
      return;
    }
    
    if (session) {
      const userRole = (session.user as any).role?.toLowerCase();
      console.log("Questions Page - User role (lowercase):", userRole);
      
      if (userRole !== "admin") {
        console.log("Questions Page - Not admin, redirecting to dashboard");
        router.push("/dashboard");
        return;
      }
      
      console.log("Questions Page - Admin confirmed, fetching questions");
      // If admin, fetch questions
      fetchQuestions();
    }
  }, [status, session, router]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/questions");
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setQuestions(questions.filter(q => q.id !== id));
      }
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setQuestions(questions.map(q => 
          q.id === id ? { ...q, isActive: !currentStatus } : q
        ));
      }
    } catch (error) {
      console.error("Error toggling question status:", error);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !selectedTopic || q.topic === selectedTopic;
    const matchesDifficulty = !selectedDifficulty || q.difficulty === selectedDifficulty;
    const matchesSource = !selectedSource || q.source === selectedSource;
    return matchesSearch && matchesTopic && matchesDifficulty && matchesSource;
  });

  const topics = Array.from(new Set(questions.map(q => q.topic))).sort();
  const difficulties = ["easy", "medium", "hard"];
  const sources = Array.from(new Set(questions.map(q => q.source || "PRACTICE"))).sort();

  const getChoicesDisplay = (choices: any): string => {
    if (typeof choices === 'string') {
      try {
        choices = JSON.parse(choices);
      } catch {
        return choices;
      }
    }
    
    if (Array.isArray(choices)) {
      return choices.slice(0, 2).join(', ') + (choices.length > 2 ? '...' : '');
    }
    
    if (typeof choices === 'object') {
      const values = Object.values(choices);
      return values.slice(0, 2).join(', ') + (values.length > 2 ? '...' : '');
    }
    
    return 'N/A';
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {status === "loading" ? "Checking authentication..." : "Loading questions..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Manage Questions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage all math questions for practice, tests, and competitions
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">All Topics</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">All Difficulties</option>
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">All Sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>

            <Button onClick={() => router.push("/admin/tests/questions")} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No questions found. Add your first question to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((question) => (
            <Card key={question.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={question.isActive ? "default" : "secondary"}>
                        {question.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {question.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs truncate max-w-[200px]">
                        {question.topic.replace(/_/g, ' ')}
                      </Badge>
                      {question.source && (
                        <Badge variant="secondary">{question.source}</Badge>
                      )}
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {question.prompt}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Choices: {getChoicesDisplay(question.choices)}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>⏱️ {question.timeLimit}s</span>
                      <span>💎 {question.gems} gems</span>
                      <span>📅 {new Date(question.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(question.id, question.isActive)}
                      title={question.isActive ? "Deactivate" : "Activate"}
                    >
                      {question.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/tests/questions`)}
                      title="Edit in Tests/Questions"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(question.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{questions.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-green-600">
              {questions.filter(q => q.isActive).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-orange-600">
              {questions.filter(q => !q.isActive).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">
              {filteredQuestions.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Filtered</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
