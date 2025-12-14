"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Play,
  Eye,
  EyeOff,
  Video,
  FileText,
  Gem
} from "lucide-react";
import Link from "next/link";

interface LearningModule {
  id: string;
  title: string;
  description?: string;
  topic: string;
  notes?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  gemsReward?: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    questions: number;
    attempts: number;
  };
}

interface LearningQuestion {
  id: string;
  prompt: string;
  choices: { [key: string]: string };
  correct: string;
  explanation?: string;
  imageUrl?: string;
  order: number;
}

interface ModuleFormData {
  title: string;
  description: string;
  topic: string;
  notes: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  gemsReward: number;
  isActive: boolean;
  order: number;
}

interface QuestionFormData {
  prompt: string;
  choices: { [key: string]: string };
  correct: string;
  explanation: string;
  imageUrl: string;
  order: number;
}

const TOPICS = [
  "algebra", "geometry", "calculus", "trigonometry", "statistics", 
  "probability", "number_theory", "linear_algebra", "differential_equations"
];

export default function AdminLearnPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [editingModule, setEditingModule] = useState<LearningModule | null>(null);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [questions, setQuestions] = useState<LearningQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<LearningQuestion | null>(null);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isDeletingModule, setIsDeletingModule] = useState<string | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<ModuleFormData>({
    title: "",
    description: "",
    topic: "",
    notes: "",
    videoUrl: "",
    thumbnailUrl: "",
    duration: 0,
    gemsReward: 0,
    isActive: true,
    order: 0
  });

  const [questionFormData, setQuestionFormData] = useState<QuestionFormData>({
    prompt: "",
    choices: { A: "", B: "", C: "", D: "" },
    correct: "",
    explanation: "",
    imageUrl: "",
    order: 0
  });

  // Handle redirect when not authenticated or not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    } else if (status === "authenticated" && session && ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  // Fetch modules
  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/learn");
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch modules:", response.status, errorData);
        setModules([]);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session && ((session.user as any).role === "admin" || (session.user as any).role === "ADMIN")) {
      fetchModules();
    }
  }, [status, session]);

  // Filter modules
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = topicFilter === "all" || !topicFilter || module.topic === topicFilter;
    return matchesSearch && matchesTopic;
  });

  const activeModules = filteredModules.filter(module => module.isActive);
  const inactiveModules = filteredModules.filter(module => !module.isActive);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const url = editingModule 
        ? `/api/admin/learn/${editingModule.id}`
        : "/api/admin/learn";
      
      const method = editingModule ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedModule: LearningModule = await response.json();
        setShowCreateModal(false);
        setEditingModule(null);
        resetForm();
        await fetchModules();
        if (!editingModule && savedModule?.id) {
          setSelectedModule(savedModule);
          fetchQuestions(savedModule.id);
          setShowQuestionsModal(true);
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving module:", error);
      alert("Failed to save module");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle question form submission
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedModule || isSubmittingQuestion) return;
    
    setIsSubmittingQuestion(true);
    try {
      const url = editingQuestion 
        ? `/api/admin/learn/${selectedModule.id}/questions/${editingQuestion.id}`
        : `/api/admin/learn/${selectedModule.id}/questions`;
      
      const method = editingQuestion ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionFormData),
      });

      if (response.ok) {
        setEditingQuestion(null);
        resetQuestionForm();
        fetchQuestions(selectedModule.id);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving question:", error);
      alert("Failed to save question");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  // Fetch questions for a module
  const fetchQuestions = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/admin/learn/${moduleId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  // Handle module actions
  const handleEdit = (module: LearningModule) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description || "",
      topic: module.topic,
      notes: module.notes || "",
      videoUrl: module.videoUrl,
      thumbnailUrl: module.thumbnailUrl || "",
      duration: module.duration,
      gemsReward: Number(module.gemsReward) || 0,
      isActive: module.isActive,
      order: module.order
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return;
    
    setIsDeletingModule(moduleId);
    try {
      const response = await fetch(`/api/admin/learn/${moduleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchModules();
      } else {
        alert("Failed to delete module");
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      alert("Failed to delete module");
    } finally {
      setIsDeletingModule(null);
    }
  };

  const handleToggleActive = async (moduleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/learn/${moduleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        fetchModules();
      } else {
        alert("Failed to update module");
      }
    } catch (error) {
      console.error("Error updating module:", error);
      alert("Failed to update module");
    }
  };

  const handleManageQuestions = (module: LearningModule) => {
    setSelectedModule(module);
    fetchQuestions(module.id);
    setShowQuestionsModal(true);
  };

  const handleEditQuestion = (question: LearningQuestion) => {
    setEditingQuestion(question);
    setQuestionFormData({
      prompt: question.prompt,
      choices: question.choices as { [key: string]: string },
      correct: question.correct,
      explanation: question.explanation || "",
      imageUrl: question.imageUrl || "",
      order: question.order
    });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedModule || !confirm("Are you sure you want to delete this question?")) return;
    
    setIsDeletingQuestion(questionId);
    try {
      const response = await fetch(`/api/admin/learn/${selectedModule.id}/questions/${questionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchQuestions(selectedModule.id);
      } else {
        alert("Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question");
    } finally {
      setIsDeletingQuestion(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      topic: "",
      notes: "",
      videoUrl: "",
      thumbnailUrl: "",
      duration: 0,
      gemsReward: 0.00001,
      isActive: true,
      order: 0
    });
  };

  const resetQuestionForm = () => {
    setQuestionFormData({
      prompt: "",
      choices: { A: "", B: "", C: "", D: "" },
      correct: "",
      explanation: "",
      imageUrl: "",
      order: 0
    });
  };

  // Generate YouTube thumbnail
  const generateYouTubeThumbnail = (videoUrl: string) => {
    const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
  };

  const handleVideoUrlChange = (videoUrl: string) => {
    setFormData(prev => ({
      ...prev,
      videoUrl,
      thumbnailUrl: generateYouTubeThumbnail(videoUrl)
    }));
  };

  const handlePreviewVideo = (videoUrl: string) => {
    if (!videoUrl) {
      alert("No video URL available");
      return;
    }
    
    // Open YouTube video in new tab
    const newWindow = window.open(videoUrl, '_blank', 'noopener,noreferrer');
    
    if (!newWindow) {
      alert("Please allow popups for this site to preview videos");
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated" || (session && (session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Learn Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Manage learning modules with video content and questions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base">
          <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Create Module</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Input
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Select value={topicFilter} onValueChange={setTopicFilter}>
            <SelectTrigger className="w-full text-sm">
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              <SelectItem value="all" className="text-sm">All Topics</SelectItem>
              {TOPICS.map(topic => (
                <SelectItem key={topic} value={topic} className="text-sm">
                  {topic.replace('_', ' ').charAt(0).toUpperCase() + topic.replace('_', ' ').slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Modules List */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Modules ({activeModules.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Modules ({inactiveModules.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeModules.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No active modules found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {activeModules.map((module) => (
                <Card key={module.id} className="relative flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">{module.title}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm line-clamp-2">
                          {module.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(module)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(module.id, false)}
                          className="text-orange-600 hover:text-orange-700 h-8 w-8 p-0"
                          title="Deactivate module"
                        >
                          <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(module.id)}
                          className="h-8 w-8 p-0"
                          disabled={isDeletingModule === module.id}
                        >
                          {isDeletingModule === module.id ? (
                            <span className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3 flex-1 flex flex-col">
                    {module.thumbnailUrl && (
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        <img
                          src={module.thumbnailUrl}
                          alt={module.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs">{Math.floor(module.duration / 60)}:{(module.duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs">{module._count?.questions || 0} Q</span>
                      </div>
                      {module.gemsReward && module.gemsReward > 0 && (
                        <div className="flex items-center gap-1">
                          <Gem className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs">{module.gemsReward}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <Badge variant="default" className="text-xs">{module.topic.replace('_', ' ')}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {module._count?.attempts || 0}
                      </Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs sm:text-sm h-8"
                        onClick={() => handlePreviewVideo(module.videoUrl)}
                      >
                        <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="truncate">Preview</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs sm:text-sm h-8"
                        onClick={() => handleManageQuestions(module)}
                      >
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="truncate">Questions</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactiveModules.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No inactive modules found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {inactiveModules.map((module) => (
                <Card key={module.id} className="relative opacity-75 flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">{module.title}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm line-clamp-2">
                          {module.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(module)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(module.id, true)}
                          className="text-green-600 hover:text-green-700 h-8 w-8 p-0"
                          title="Activate module"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(module.id)}
                          className="h-8 w-8 p-0"
                          disabled={isDeletingModule === module.id}
                        >
                          {isDeletingModule === module.id ? (
                            <span className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs">{Math.floor(module.duration / 60)}:{(module.duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs">{module._count?.questions || 0} Q</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageQuestions(module)}
                        className="text-xs sm:text-sm h-8"
                      >
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Questions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Module Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingModule ? "Edit Learning Module" : "Create Learning Module"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingModule(null);
                  resetForm();
                }}
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="topic">Topic *</Label>
                  <Select
                    value={formData.topic}
                    onValueChange={(value) => setFormData({ ...formData, topic: value })}
                    required
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Select Topic" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px] overflow-y-auto">
                      {TOPICS.map(topic => (
                        <SelectItem key={topic} value={topic} className="text-sm">
                          {topic.replace('_', ' ').charAt(0).toUpperCase() + topic.replace('_', ' ').slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Additional notes or instructions for learners..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="videoUrl">Video URL *</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration (seconds) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gemsReward">Gems Reward (optional)</Label>
                  <Input
                    id="gemsReward"
                    type="number"
                    value={formData.gemsReward}
                    onChange={(e) => setFormData({ ...formData, gemsReward: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.00001"
                    placeholder="0.00001 for no reward"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave as 0 if no gems should be awarded
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingModule(null);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {editingModule ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingModule ? "Update Module" : "Create Module"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Questions Modal */}
      {showQuestionsModal && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Questions for: {selectedModule.title}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowQuestionsModal(false);
                  setSelectedModule(null);
                  setQuestions([]);
                }}
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Questions List */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingQuestion(null);
                      resetQuestionForm();
                    }}
                    disabled={isSubmittingQuestion}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Multiple Questions
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">Q{index + 1}: {question.prompt.substring(0, 50)}...</p>
                          <p className="text-xs text-muted-foreground">Order: {question.order}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                            disabled={isDeletingQuestion === question.id}
                          >
                            {isDeletingQuestion === question.id ? (
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Question Form */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {editingQuestion ? "Edit Question" : "Add Question"}
                </h3>
                
                <form onSubmit={handleQuestionSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="questionPrompt">Question *</Label>
                    <Textarea
                      id="questionPrompt"
                      value={questionFormData.prompt}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, prompt: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(questionFormData.choices).map(([key, value]) => (
                      <div key={key}>
                        <Label htmlFor={`choice${key}`}>Choice {key} *</Label>
                        <Input
                          id={`choice${key}`}
                          value={value}
                          onChange={(e) => setQuestionFormData({
                            ...questionFormData,
                            choices: { ...questionFormData.choices, [key]: e.target.value }
                          })}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="correctAnswer">Correct Answer *</Label>
                    <select
                      id="correctAnswer"
                      value={questionFormData.correct}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, correct: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Correct Answer</option>
                      {Object.entries(questionFormData.choices).map(([key, value]) => (
                        <option key={key} value={value}>{key}: {value}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="explanation">Explanation</Label>
                    <Textarea
                      id="explanation"
                      value={questionFormData.explanation}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, explanation: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={questionFormData.imageUrl}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add an image to accompany the question (Cloudinary URL recommended)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="questionOrder">Order</Label>
                    <Input
                      id="questionOrder"
                      type="number"
                      value={questionFormData.order}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, order: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingQuestion(null);
                        resetQuestionForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmittingQuestion}>
                      {isSubmittingQuestion ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          {editingQuestion ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        editingQuestion ? "Update Question" : "Create Question"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 