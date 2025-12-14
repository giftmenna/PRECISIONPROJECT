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
  Calendar, 
  Clock, 
  Users, 
  School,
  BookOpen
} from "lucide-react";

interface Exam {
  id: string;
  name: string;
  description: string;
  startsAt: string;
  endsAt: string;
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  _count: {
    participants: number;
    questions: number;
  };
}

export default function AdminExamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startsAt: "",
    endsAt: "",
    duration: 60,
    totalQuestions: 20,
    passingScore: 70,
    status: "DRAFT" as 'DRAFT' | 'ACTIVE' | 'COMPLETED'
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
      router.push("/auth/login");
      return;
    }

    fetchExams();
  }, [session, status, router]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      // For now, we'll use a placeholder since exams API doesn't exist yet
      // const response = await fetch('/api/admin/exams');
      // if (response.ok) {
      //   const data = await response.json();
      //   setExams(data.exams || []);
      // }
      setExams([]); // Placeholder - no exams yet
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async () => {
    try {
      // For now, we'll just show an alert since the API doesn't exist yet
      alert('Exam creation functionality will be implemented soon!');
      setShowCreateModal(false);
      setFormData({
        name: "",
        description: "",
        startsAt: "",
        endsAt: "",
        duration: 60,
        totalQuestions: 20,
        passingScore: 70,
        status: "DRAFT"
      });
    } catch (error) {
      console.error("Error creating exam:", error);
    }
  };

  const handleEditExam = async () => {
    if (!selectedExam) return;

    try {
      // For now, we'll just show an alert since the API doesn't exist yet
      alert('Exam editing functionality will be implemented soon!');
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating exam:", error);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this exam? This action cannot be undone.")) {
      return;
    }

    try {
      // For now, we'll just show an alert since the API doesn't exist yet
      alert('Exam deletion functionality will be implemented soon!');
    } catch (error) {
      console.error("Error deleting exam:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Edit className="h-4 w-4" />;
      case 'ACTIVE': return <Clock className="h-4 w-4" />;
      case 'COMPLETED': return <School className="h-4 w-4" />;
      default: return <Edit className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Access denied. Please log in as admin.</p>
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
                Exam Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Create and manage comprehensive exams for student assessments.
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
                onClick={fetchExams}
                variant="outline"
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                🔄 Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs sm:text-sm w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create Exam</span>
            <span className="sm:hidden">Create Exam</span>
          </Button>
        </div>

        {/* Exams List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Exams</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first exam to get started.</p>
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => router.push('/admin/exams/questions')} className="text-xs sm:text-sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Manage Questions</span>
                  <span className="sm:hidden">Questions</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams
              .filter(exam => exam.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{exam.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {exam.description}
                      </p>
                    </div>
                    <Badge className={getStatusColor(exam.status)}>
                      {getStatusIcon(exam.status)}
                      {exam.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Starts: {formatDateTime(exam.startsAt)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Duration: {exam.duration} minutes</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>{exam.totalQuestions} questions</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{exam._count.participants} participants</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <School className="h-4 w-4 mr-2" />
                      <span>Passing: {exam.passingScore}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedExam(exam);
                        setFormData({
                          name: exam.name,
                          description: exam.description,
                          startsAt: exam.startsAt.split('T')[0],
                          endsAt: exam.endsAt.split('T')[0],
                          duration: exam.duration,
                          totalQuestions: exam.totalQuestions,
                          passingScore: exam.passingScore,
                          status: exam.status
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
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/exams/${exam.id}/questions`)}
                      className="text-xs"
                    >
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Questions</span>
                      <span className="sm:hidden">Questions</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteExam(exam.id)}
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
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Create Exam</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Exam name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Exam description"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={formData.startsAt}
                      onChange={(e) => setFormData({...formData, startsAt: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={formData.endsAt}
                      onChange={(e) => setFormData({...formData, endsAt: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                      min="30"
                      max="180"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Questions</label>
                    <Input
                      type="number"
                      value={formData.totalQuestions}
                      onChange={(e) => setFormData({...formData, totalQuestions: Number(e.target.value)})}
                      min="5"
                      max="100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
                  <Input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({...formData, passingScore: Number(e.target.value)})}
                    min="50"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1 text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button onClick={handleCreateExam} className="flex-1 text-xs sm:text-sm">
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Exam</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Exam name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Exam description"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={formData.startsAt}
                      onChange={(e) => setFormData({...formData, startsAt: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={formData.endsAt}
                      onChange={(e) => setFormData({...formData, endsAt: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                      min="30"
                      max="180"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Questions</label>
                    <Input
                      type="number"
                      value={formData.totalQuestions}
                      onChange={(e) => setFormData({...formData, totalQuestions: Number(e.target.value)})}
                      min="5"
                      max="100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
                  <Input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({...formData, passingScore: Number(e.target.value)})}
                    min="50"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1 text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button onClick={handleEditExam} className="flex-1 text-xs sm:text-sm">
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