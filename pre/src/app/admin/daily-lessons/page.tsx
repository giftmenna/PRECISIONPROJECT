"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, Play, Users, Gem, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import dynamic from "next/dynamic";


// Add error handling for the dynamic import
const CompetitionQuestionBuilder = dynamic( // This remains for other potential uses, but we will use DailyLessonQuestionForm for lessons.
  () => import("@/components/CompetitionQuestionBuilder"),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-6 w-full max-w-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading question builder...</p>
          </div>
        </div>
      </div>
    )
  }
);

import { DailyLesson, CreateDailyLessonInput, DailyLessonQuestion } from "@/types/daily-lesson";



export default function DailyLessonsPage() {
  const [lessons, setLessons] = useState<DailyLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<DailyLesson | null>(null);
  const [openBuilderForLesson, setOpenBuilderForLesson] = useState<DailyLesson | null>(null);  
  const [builderInitialQuestions, setBuilderInitialQuestions] = useState<any[]>([]);
  const [formData, setFormData] = useState<CreateDailyLessonInput>({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    duration: 0,
    requiredWatchDuration: 120,
    scheduledDate: "",
    scheduledTime: "",
    isActive: true,
    autoStack: false,
    gemsReward: 0.00001
  });

  // Helper to normalize lesson objects with inconsistent casing
  const normalizeLesson = (lesson: any): DailyLesson => {
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl || lesson.videourl,
      thumbnailUrl: lesson.thumbnailUrl || lesson.thumbnailurl,
      duration: lesson.duration,
      requiredWatchDuration: lesson.requiredWatchDuration || lesson.requiredwatchduration,
      scheduledDate: lesson.scheduledDate || lesson.scheduleddate,
      scheduledTime: lesson.scheduledTime || lesson.scheduledtime,
      isActive: lesson.isActive ?? lesson.isactive ?? true,
      autoStack: lesson.autoStack ?? lesson.autostack ?? false,
      gemsReward: lesson.gemsReward ?? lesson.gemsreward,
      _count: lesson._count,
    } as DailyLesson;
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch("/api/admin/daily-lessons");
      if (response.ok) {
        const data = await response.json();
        // Normalize lessons to handle inconsistent casing from the API
        setLessons(data.map(normalizeLesson));
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast({
        title: "Error",
        description: "Failed to fetch daily lessons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug: Log the form data being sent
    console.log('Submitting form data:', formData);
    
    try {
      const url = editingLesson 
        ? `/api/admin/daily-lessons/${editingLesson.id}`
        : "/api/admin/daily-lessons";
      
      const method = editingLesson ? "PUT" : "POST";
      
      console.log('Making request to:', url, 'with method:', method);
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (response.ok) {
        toast({
          title: "Success",
          description: editingLesson 
            ? "Daily lesson updated successfully" 
            : "Daily lesson created successfully",
        });
        setShowCreateModal(false);
        setEditingLesson(null);
        resetForm();
        fetchLessons();
      } else {
        let errorMessage = "Failed to save lesson";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save lesson",
        variant: "destructive",
      });
    }
  };

  const getYouTubeThumbnail = (url: string): string | null => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      let videoId = urlObj.searchParams.get("v");
      if (!videoId && urlObj.hostname === "youtu.be") {
        videoId = urlObj.pathname.slice(1);
      }
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    } catch (e) {
      // Invalid URL, do nothing
    }
    return null;
  };

  const handleVideoUrlChange = (videoUrl: string) => {
    const thumbnailUrl = getYouTubeThumbnail(videoUrl);
    setFormData(prev => ({
      ...prev,
      videoUrl,
      thumbnailUrl: thumbnailUrl || prev.thumbnailUrl,
    }));
  };

  const handleEdit = (lesson: DailyLesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
      thumbnailUrl: lesson.thumbnailUrl || "",
      duration: lesson.duration,
      requiredWatchDuration: lesson.requiredWatchDuration || 120,
      // Handle potential full ISO string for date
      scheduledDate: lesson.scheduledDate ? lesson.scheduledDate.split("T")[0] : "",
      scheduledTime: lesson.scheduledTime || "",
      isActive: lesson.isActive,
      autoStack: lesson.autoStack,
      gemsReward: lesson.gemsReward || 0.00001
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    
    try {
      const response = await fetch(`/api/admin/daily-lessons/${lessonId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Daily lesson deleted successfully",
        });
        fetchLessons();
      } else {
        throw new Error("Failed to delete lesson");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast({
        title: "Error",
        description: "Failed to delete lesson",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (lessonId: string, isActive: boolean) => {
    const action = isActive ? "activate" : "deactivate";
    if (!confirm(`Are you sure you want to ${action} this lesson?`)) return;
    
    try {
      const response = await fetch(`/api/admin/daily-lessons/${lessonId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Lesson ${action}d successfully`,
        });
        fetchLessons();
      } else {
        throw new Error(`Failed to ${action} lesson`);
      }
    } catch (error) {
      console.error(`Error ${action}ing lesson:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} lesson`,
        variant: "destructive",
      });
    }
  };

  const handleOpenQuestionBuilder = async (lesson: DailyLesson) => {
    if (lesson.id === 'new') return; // Should not happen with new workflow
    setOpenBuilderForLesson(lesson);
    setBuilderInitialQuestions([]); // Reset previous questions

    try {
      const response = await fetch(`/api/admin/daily-lessons/${lesson.id}/questions`);
      if (response.ok) {
        const { questions } = await response.json();
        if (questions) {
          setBuilderInitialQuestions(questions);
        }
      }
      // If response is not ok (e.g., 404), we'll just show an empty builder, which is fine.
    } catch (error) {
      console.error("Failed to fetch existing questions:", error);
      toast({ title: "Error", description: "Could not load existing questions.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      duration: 0,
      requiredWatchDuration: 120,
      scheduledDate: "",
      scheduledTime: "",
      isActive: true,
      autoStack: false,
      gemsReward: 0.00001
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Note: lessons may still use snake/lower-case properties depending on backend, so use flexible checks when needed
  const activeLessons = lessons.filter(lesson => lesson.isActive);
  const inactiveLessons = lessons.filter(lesson => !lesson.isActive);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading daily lessons...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Daily Lessons & Quizzes</h1>
          <p className="text-muted-foreground">
            Manage daily video lessons and attach post-lesson questions
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Lesson
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Lessons ({activeLessons.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Lessons ({inactiveLessons.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeLessons.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No active lessons found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeLessons.map((lesson) => (
                <Card key={lesson.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {lesson.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(lesson)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenQuestionBuilder(lesson)}
                          title="Add/Manage Questions"
                        >
                          Add Questions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(lesson.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lesson.thumbnailUrl && (
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        <img
                          src={lesson.thumbnailUrl}
                          alt={lesson.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(lesson.duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(lesson.scheduledDate)}
                        {lesson.scheduledTime && ` at ${lesson.scheduledTime}`}
                      </div>
                      <div className="flex items-center gap-1">
                        <Gem className="h-4 w-4" />
                        {lesson.gemsReward} gems
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={lesson.autoStack ? "default" : "secondary"}>
                        {lesson.autoStack ? "Auto-Stack" : "Manual"}
                      </Badge>
                      {(() => {
                        const count = lesson._count;
                        if (count && count.watchedBy > 0) {
                          return (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {count.watchedBy} views
                            </Badge>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(lesson.videoUrl, '_blank')}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Preview Video
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(lesson.id, false)}
                        className="text-orange-600 hover:text-orange-700"
                        title="Deactivate lesson"
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactiveLessons.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No inactive lessons found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inactiveLessons.map((lesson) => (
                <Card key={lesson.id} className="relative opacity-75">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {lesson.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(lesson)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenQuestionBuilder(lesson)}
                          title="Add/Manage Questions"
                        >
                          Add Questions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(lesson.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(lesson.scheduledDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Gem className="h-4 w-4" />
                        {lesson.gemsReward} gems
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="secondary">Inactive</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(lesson.id, true)}
                        className="text-green-600 hover:text-green-700"
                        title="Activate lesson"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-background rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingLesson ? "Edit Daily Lesson" : "Create Daily Lesson"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingLesson(null);
                  resetForm();
                }}
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledTime">Scheduled Time (Optional)</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    placeholder="09:00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty for all-day availability, or set specific time (e.g., 09:00 for 9 AM)
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="videoUrl">Video URL *</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="thumbnailUrl">Thumbnail URL (Auto-generated from YouTube)</Label>
                  <Input
                    id="thumbnailUrl"
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="Auto-generated from YouTube video URL"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically generated from YouTube video. You can override with a custom URL if needed.
                  </p>
                  {formData.thumbnailUrl && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Thumbnail Preview:</p>
                      <img
                        src={formData.thumbnailUrl}
                        alt="Thumbnail preview"
                        className="w-32 h-20 object-cover rounded border"
                        onError={(e) => {
                          // Show a fallback image if thumbnail fails to load
                          e.currentTarget.src = '/placeholder-image.svg';
                          e.currentTarget.alt = 'Thumbnail not available';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                
                <div>
                  <Label htmlFor="requiredWatchDuration">Required Watch (seconds) *</Label>
                  <Input
                    id="requiredWatchDuration"
                    type="number"
                    value={formData.requiredWatchDuration}
                    onChange={(e) => setFormData({ ...formData, requiredWatchDuration: parseInt(e.target.value) || 120 })}
                    min="1"
                    max={formData.duration}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum time user must watch to earn gems
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="gemsReward">Gem Reward *</Label>
                  <Input
                    id="gemsReward"
                    type="number"
                    step="0.00001"
                    value={formData.gemsReward}
                    onChange={(e) => setFormData({ ...formData, gemsReward: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00001"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Set any amount (e.g., 0.00001, 0.001, 0.25, 1.5, 10)
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoStack"
                    checked={formData.autoStack}
                    onCheckedChange={(checked) => setFormData({ ...formData, autoStack: checked })}
                  />
                  <Label htmlFor="autoStack">Auto-Stack (Preloaded)</Label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingLesson(null);
                    resetForm();
                  }}
                  className="text-xs sm:text-sm w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="text-xs sm:text-sm w-full sm:w-auto">
                  {editingLesson ? "Update Lesson" : "Create Lesson"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Builder Modal */}
      {openBuilderForLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <CompetitionQuestionBuilder
              competitionType="test"
              initialQuestions={builderInitialQuestions}
              onCancel={() => {
                setOpenBuilderForLesson(null);
                setBuilderInitialQuestions([]);
              }}
              onSave={async (questions) => {
                if (!openBuilderForLesson) return;
                try {
                  const response = await fetch(`/api/admin/daily-lessons/${openBuilderForLesson.id}/questions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ questions }),
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to save questions');
                  }

                  toast({ title: 'Success', description: 'Questions saved successfully' });
                  setOpenBuilderForLesson(null);
                } catch (err) {
                  console.error('Question save error:', err);
                  toast({
                    title: 'Error',
                    description: err instanceof Error ? err.message : 'Failed to save questions',
                    variant: 'destructive',
                  });
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}