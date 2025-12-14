"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  Trophy, 
  Gem, 
  BookOpen,
  Settings,
  CheckCircle,
  XCircle,
  GraduationCap,
  FileText,
  School
} from "lucide-react";

interface RegularCompetition {
  id: string;
  name: string;
  description: string;
  startsAt: string;
  endsAt: string;
  dropIntervalHours: number;
  dropOpenMinutes: number;
  questionsPerDrop: number;
  entryType: 'FREE' | 'PAID';
  entryPriceNgn: number | null;
  entryPriceGem: number | null;
  prizeCashNgn: number;
  prizeSchema: any;
  timeLimit?: number;
  requireImageUpload?: boolean;
  showExplanations?: boolean;
  status: 'DRAFT' | 'COMING_SOON' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  _count: {
    entries: number;
    drops: number;
  };
}

interface GradeCompetition {
  id: string;
  name: string;
  description: string;
  startsAt: string;
  endsAt: string;
  grade: string;
  entryFee: number;
  timeLimit?: number;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  _count: {
    entries: number;
    questions: number;
  };
}

export default function AdminCompetitionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("regular");
  const [regularCompetitions, setRegularCompetitions] = useState<RegularCompetition[]>([]);
  const [gradeCompetitions, setGradeCompetitions] = useState<GradeCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Regular competition modals
  const [showRegularCreateModal, setShowRegularCreateModal] = useState(false);
  const [showRegularEditModal, setShowRegularEditModal] = useState(false);
  const [selectedRegularCompetition, setSelectedRegularCompetition] = useState<RegularCompetition | null>(null);
  const [regularFormData, setRegularFormData] = useState({
    name: "",
    description: "",
    startsAt: "",
    endsAt: "",
    dropIntervalHours: 24,
    dropOpenMinutes: 120,
    questionsPerDrop: 1,
    entryType: "PAID" as 'FREE' | 'PAID',
    entryPriceNgn: 200,
    entryPriceGem: 3,
    prizeCashNgn: 200000,
    timeLimit: 1800, // 30 minutes in seconds
    requireImageUpload: false,
    showExplanations: true,
    status: "DRAFT" as 'DRAFT' | 'COMING_SOON' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  });

  // Grade competition modals
  const [showGradeCreateModal, setShowGradeCreateModal] = useState(false);
  const [showGradeEditModal, setShowGradeEditModal] = useState(false);
  const [selectedGradeCompetition, setSelectedGradeCompetition] = useState<GradeCompetition | null>(null);
  const [gradeFormData, setGradeFormData] = useState({
    name: "",
    description: "",
    startsAt: "",
    endsAt: "",
    grade: "Grade 1",
    entryFee: 3,
    timeLimit: 1800, // 30 minutes in seconds
    status: "DRAFT" as 'DRAFT' | 'ACTIVE' | 'COMPLETED'
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
      router.push("/auth/login");
      return;
    }

    fetchAllCompetitions();
  }, [session, status, router]);

  const fetchAllCompetitions = async () => {
    try {
      setLoading(true);
      
      // Fetch regular competitions
      const regularResponse = await fetch('/api/admin/competitions');
      if (regularResponse.ok) {
        const regularData = await regularResponse.json();
        setRegularCompetitions(regularData.competitions || []);
      }

      // Fetch grade competitions
      const gradeResponse = await fetch('/api/admin/grade-competitions');
      if (gradeResponse.ok) {
        const gradeData = await gradeResponse.json();
        setGradeCompetitions(gradeData.competitions || []);
      }
    } catch (error) {
      console.error("Error fetching competitions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Regular competition handlers
  const handleCreateRegularCompetition = async () => {
    try {
      const response = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regularFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create competition");
      }

      setShowRegularCreateModal(false);
      setRegularFormData({
        name: "",
        description: "",
        startsAt: "",
        endsAt: "",
        dropIntervalHours: 24,
        dropOpenMinutes: 120,
        questionsPerDrop: 1,
        entryType: "PAID",
        entryPriceNgn: 200,
        entryPriceGem: 3,
        prizeCashNgn: 200000,
        timeLimit: 1800,
        requireImageUpload: false,
        showExplanations: true,
        status: "DRAFT"
      });
      fetchAllCompetitions();
    } catch (error) {
      console.error("Error creating regular competition:", error);
      alert(`Error creating competition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditRegularCompetition = async () => {
    if (!selectedRegularCompetition) return;

    try {
      const response = await fetch(`/api/admin/competitions/${selectedRegularCompetition.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regularFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update competition");
      }

      setShowRegularEditModal(false);
      fetchAllCompetitions();
    } catch (error) {
      console.error("Error updating regular competition:", error);
      alert(`Error updating competition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteRegularCompetition = async (competitionId: string) => {
    if (!confirm("Are you sure you want to delete this competition? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/competitions/${competitionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error("Failed to delete competition");

      fetchAllCompetitions();
    } catch (error) {
      console.error("Error deleting regular competition:", error);
    }
  };

  // Grade competition handlers
  const handleCreateGradeCompetition = async () => {
    try {
      const response = await fetch('/api/admin/grade-competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeFormData)
      });

      if (!response.ok) throw new Error("Failed to create grade competition");

      setShowGradeCreateModal(false);
      setGradeFormData({
        name: "",
        description: "",
        startsAt: "",
        endsAt: "",
        grade: "Grade 1",
        entryFee: 3,
        timeLimit: 1800,
        status: "DRAFT"
      });
      fetchAllCompetitions();
    } catch (error) {
      console.error("Error creating grade competition:", error);
    }
  };

  const handleEditGradeCompetition = async () => {
    if (!selectedGradeCompetition) return;

    try {
      const response = await fetch(`/api/admin/grade-competitions/${selectedGradeCompetition.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeFormData)
      });

      if (!response.ok) throw new Error("Failed to update grade competition");

      setShowGradeEditModal(false);
      fetchAllCompetitions();
    } catch (error) {
      console.error("Error updating grade competition:", error);
    }
  };

  const handleDeleteGradeCompetition = async (competitionId: string) => {
    if (!confirm("Are you sure you want to delete this grade competition? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/grade-competitions/${competitionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error("Failed to delete grade competition");

      fetchAllCompetitions();
    } catch (error) {
      console.error("Error deleting grade competition:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'COMING_SOON': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Settings className="h-4 w-4" />;
      case 'COMING_SOON': return <Clock className="h-4 w-4" />;
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />;
      case 'COMPLETED': return <Trophy className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Competition Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manage all competitions including weekly challenges and grade-specific competitions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => router.push('/admin/dashboard')}
                variant="outline"
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                ← Go Back
              </Button>
              <Button 
                onClick={fetchAllCompetitions}
                variant="outline"
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                🔄 Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
            <TabsTrigger value="regular" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Weekly</span>
              <span className="sm:hidden">Weekly</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Tests</span>
              <span className="sm:hidden">Tests</span>
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <School className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Exams</span>
              <span className="sm:hidden">Exams</span>
            </TabsTrigger>
            <TabsTrigger value="grade" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Grade</span>
              <span className="sm:hidden">Grade</span>
            </TabsTrigger>
          </TabsList>

          {/* Regular Competitions Tab */}
          <TabsContent value="regular" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search competitions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading competitions...</p>
              </div>
            ) : regularCompetitions.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Weekly Competitions</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first weekly competition to get started.</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button variant="outline" onClick={() => router.push('/admin/competitions/questions')} className="text-xs sm:text-sm">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Questions</span>
                      <span className="sm:hidden">Questions</span>
                    </Button>
                    <Button onClick={() => setShowRegularCreateModal(true)} className="text-xs sm:text-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Create Weekly Competition</span>
                      <span className="sm:hidden">Create Weekly</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regularCompetitions
                  .filter(comp => comp.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((competition) => (
                  <Card key={competition.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{competition.name}</CardTitle>
                          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                            {competition.description}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(competition.status)}>
                          {getStatusIcon(competition.status)}
                          {competition.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Starts: {formatDateTime(competition.startsAt)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Ends: {formatDateTime(competition.endsAt)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{competition._count.entries} participants</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Gem className="h-4 w-4 mr-2" />
                          <span>Entry: {competition.entryType === 'FREE' ? 'Free' : `${competition.entryPriceGem} gems`}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Trophy className="h-4 w-4 mr-2" />
                          <span>Prize: ₦{competition.prizeCashNgn.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRegularCompetition(competition);
                            setRegularFormData({
                              name: competition.name,
                              description: competition.description,
                              startsAt: competition.startsAt.split('T')[0],
                              endsAt: competition.endsAt.split('T')[0],
                              dropIntervalHours: competition.dropIntervalHours,
                              dropOpenMinutes: competition.dropOpenMinutes,
                              questionsPerDrop: competition.questionsPerDrop,
                              entryType: competition.entryType,
                              entryPriceNgn: competition.entryPriceNgn || 0,
                              entryPriceGem: competition.entryPriceGem || 0,
                              prizeCashNgn: competition.prizeCashNgn,
                              timeLimit: competition.timeLimit || 1800,
                              requireImageUpload: competition.requireImageUpload || false,
                              showExplanations: competition.showExplanations !== false,
                              status: competition.status
                            });
                            setShowRegularEditModal(true);
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
                          onClick={() => router.push(`/admin/competitions/${competition.id}/questions`)}
                          className="text-xs"
                        >
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Questions</span>
                          <span className="sm:hidden">Questions</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRegularCompetition(competition.id)}
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
          </TabsContent>

          {/* Grade Competitions Tab */}
          <TabsContent value="grade" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search grade competitions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading grade competitions...</p>
              </div>
            ) : gradeCompetitions.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Grade Competitions</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first grade-specific competition to get started.</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button variant="outline" onClick={() => router.push('/admin/grade-competitions/questions')} className="text-xs sm:text-sm">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Questions</span>
                      <span className="sm:hidden">Questions</span>
                    </Button>
                    <Button onClick={() => setShowGradeCreateModal(true)} className="text-xs sm:text-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Create Grade Competition</span>
                      <span className="sm:hidden">Create Grade</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {gradeCompetitions
                  .filter(comp => comp.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((competition) => (
                  <Card key={competition.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{competition.name}</CardTitle>
                          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                            {competition.description}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(competition.status)}>
                          {getStatusIcon(competition.status)}
                          {competition.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Starts: {formatDateTime(competition.startsAt)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Ends: {formatDateTime(competition.endsAt)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          <span>Grade: {competition.grade}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{competition._count.entries} participants</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Gem className="h-4 w-4 mr-2" />
                          <span>Entry: {competition.entryFee} gems</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <BookOpen className="h-4 w-4 mr-2" />
                          <span>{competition._count.questions} questions</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedGradeCompetition(competition);
                            setGradeFormData({
                              name: competition.name,
                              description: competition.description,
                              startsAt: competition.startsAt.split('T')[0],
                              endsAt: competition.endsAt.split('T')[0],
                              grade: competition.grade,
                              entryFee: competition.entryFee,
                              timeLimit: competition.timeLimit || 1800,
                              status: competition.status
                            });
                            setShowGradeEditModal(true);
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
                          onClick={() => router.push(`/admin/grade-competitions/${competition.id}/questions`)}
                          className="text-xs"
                        >
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Questions</span>
                          <span className="sm:hidden">Questions</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteGradeCompetition(competition.id)}
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
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>

            <Card className="text-center py-8">
              <CardContent>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Test Management</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Manage test questions and create test sets for your competitions.</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button variant="outline" onClick={() => router.push('/admin/tests/questions')} className="text-xs sm:text-sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Manage Questions</span>
                    <span className="sm:hidden">Questions</span>
                  </Button>
                  <Button onClick={() => router.push('/admin/test-sets')} className="text-xs sm:text-sm">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Manage Test Sets</span>
                    <span className="sm:hidden">Test Sets</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            </div>

            <Card className="text-center py-8">
              <CardContent>
                <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Exam Management</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Manage exam questions and create comprehensive assessments for students.</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button variant="outline" onClick={() => router.push('/admin/exams/questions')} className="text-xs sm:text-sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Manage Questions</span>
                    <span className="sm:hidden">Questions</span>
                  </Button>
                  <Button onClick={() => router.push('/admin/exams')} className="text-xs sm:text-sm">
                    <School className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Manage Exams</span>
                    <span className="sm:hidden">Exams</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Regular Competition Create Modal */}
        {showRegularCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Create Weekly Competition</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={regularFormData.name}
                    onChange={(e) => setRegularFormData({...regularFormData, name: e.target.value})}
                    placeholder="Competition name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    value={regularFormData.description}
                    onChange={(e) => setRegularFormData({...regularFormData, description: e.target.value})}
                    placeholder="Competition description"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={regularFormData.startsAt}
                      onChange={(e) => setRegularFormData({...regularFormData, startsAt: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={regularFormData.endsAt}
                      onChange={(e) => setRegularFormData({...regularFormData, endsAt: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Entry Type</label>
                    <select
                      value={regularFormData.entryType}
                      onChange={(e) => setRegularFormData({...regularFormData, entryType: e.target.value as 'FREE' | 'PAID'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="FREE">Free</option>
                      <option value="PAID">Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Entry Fee (Gems)</label>
                    <Input
                      type="number"
                      value={regularFormData.entryPriceGem}
                      onChange={(e) => setRegularFormData({...regularFormData, entryPriceGem: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prize Pool (Gems)</label>
                  <Input
                    type="number"
                    value={regularFormData.prizeCashNgn}
                    onChange={(e) => setRegularFormData({...regularFormData, prizeCashNgn: Number(e.target.value)})}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                  <Input
                    type="number"
                    min="60"
                    max="7200"
                    value={regularFormData.timeLimit}
                    onChange={(e) => setRegularFormData({...regularFormData, timeLimit: Number(e.target.value)})}
                    placeholder="1800"
                  />
                  <p className="text-xs text-gray-500 mt-1">Time limit for each drop (60-7200 seconds)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={regularFormData.status}
                    onChange={(e) => setRegularFormData({...regularFormData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="COMING_SOON">Coming Soon</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requireImageUpload"
                      checked={regularFormData.requireImageUpload}
                      onChange={(e) => setRegularFormData({...regularFormData, requireImageUpload: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="requireImageUpload" className="text-sm font-medium">
                      Require image upload for solutions
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    When enabled, participants must upload images of their work. These will be reviewed manually.
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showExplanations"
                      checked={regularFormData.showExplanations}
                      onChange={(e) => setRegularFormData({...regularFormData, showExplanations: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="showExplanations" className="text-sm font-medium">
                      Show explanations at the end
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    When enabled, participants will see correct answers and explanations after completing the competition.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowRegularCreateModal(false)} className="flex-1 text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button onClick={handleCreateRegularCompetition} className="flex-1 text-xs sm:text-sm">
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Regular Competition Edit Modal */}
        {showRegularEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Weekly Competition</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={regularFormData.name}
                    onChange={(e) => setRegularFormData({...regularFormData, name: e.target.value})}
                    placeholder="Competition name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    value={regularFormData.description}
                    onChange={(e) => setRegularFormData({...regularFormData, description: e.target.value})}
                    placeholder="Competition description"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={regularFormData.startsAt}
                      onChange={(e) => setRegularFormData({...regularFormData, startsAt: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={regularFormData.endsAt}
                      onChange={(e) => setRegularFormData({...regularFormData, endsAt: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Entry Type</label>
                    <select
                      value={regularFormData.entryType}
                      onChange={(e) => setRegularFormData({...regularFormData, entryType: e.target.value as 'FREE' | 'PAID'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="FREE">Free</option>
                      <option value="PAID">Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Entry Fee (Gems)</label>
                    <Input
                      type="number"
                      value={regularFormData.entryPriceGem}
                      onChange={(e) => setRegularFormData({...regularFormData, entryPriceGem: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prize Pool (Gems)</label>
                  <Input
                    type="number"
                    value={regularFormData.prizeCashNgn}
                    onChange={(e) => setRegularFormData({...regularFormData, prizeCashNgn: Number(e.target.value)})}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                  <Input
                    type="number"
                    min="60"
                    max="7200"
                    value={regularFormData.timeLimit}
                    onChange={(e) => setRegularFormData({...regularFormData, timeLimit: Number(e.target.value)})}
                    placeholder="1800"
                  />
                  <p className="text-xs text-gray-500 mt-1">Time limit for each drop (60-7200 seconds)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={regularFormData.status}
                    onChange={(e) => setRegularFormData({...regularFormData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="COMING_SOON">Coming Soon</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowRegularEditModal(false)} className="flex-1 text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button onClick={handleEditRegularCompetition} className="flex-1 text-xs sm:text-sm">
                  Update
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Grade Competition Create Modal */}
        {showGradeCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Create Grade Competition</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={gradeFormData.name}
                    onChange={(e) => setGradeFormData({...gradeFormData, name: e.target.value})}
                    placeholder="Grade competition name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    value={gradeFormData.description}
                    onChange={(e) => setGradeFormData({...gradeFormData, description: e.target.value})}
                    placeholder="Competition description"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={gradeFormData.startsAt}
                      onChange={(e) => setGradeFormData({...gradeFormData, startsAt: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={gradeFormData.endsAt}
                      onChange={(e) => setGradeFormData({...gradeFormData, endsAt: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Grade</label>
                    <select
                      value={gradeFormData.grade}
                      onChange={(e) => setGradeFormData({...gradeFormData, grade: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Entry Fee (Gems)</label>
                    <Input
                      type="number"
                      value={gradeFormData.entryFee}
                      onChange={(e) => setGradeFormData({...gradeFormData, entryFee: Number(e.target.value)})}
                      placeholder="3"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                  <Input
                    type="number"
                    min="60"
                    max="7200"
                    value={gradeFormData.timeLimit}
                    onChange={(e) => setGradeFormData({...gradeFormData, timeLimit: Number(e.target.value)})}
                    placeholder="1800"
                  />
                  <p className="text-xs text-gray-500 mt-1">Time limit for the entire competition (60-7200 seconds)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={gradeFormData.status}
                    onChange={(e) => setGradeFormData({...gradeFormData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowGradeCreateModal(false)} className="flex-1 text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button onClick={handleCreateGradeCompetition} className="flex-1 text-xs sm:text-sm">
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Grade Competition Edit Modal */}
        {showGradeEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Grade Competition</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={gradeFormData.name}
                    onChange={(e) => setGradeFormData({...gradeFormData, name: e.target.value})}
                    placeholder="Grade competition name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    value={gradeFormData.description}
                    onChange={(e) => setGradeFormData({...gradeFormData, description: e.target.value})}
                    placeholder="Competition description"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={gradeFormData.startsAt}
                      onChange={(e) => setGradeFormData({...gradeFormData, startsAt: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={gradeFormData.endsAt}
                      onChange={(e) => setGradeFormData({...gradeFormData, endsAt: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Grade</label>
                    <select
                      value={gradeFormData.grade}
                      onChange={(e) => setGradeFormData({...gradeFormData, grade: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Entry Fee (Gems)</label>
                    <Input
                      type="number"
                      value={gradeFormData.entryFee}
                      onChange={(e) => setGradeFormData({...gradeFormData, entryFee: Number(e.target.value)})}
                      placeholder="3"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                  <Input
                    type="number"
                    min="60"
                    max="7200"
                    value={gradeFormData.timeLimit}
                    onChange={(e) => setGradeFormData({...gradeFormData, timeLimit: Number(e.target.value)})}
                    placeholder="1800"
                  />
                  <p className="text-xs text-gray-500 mt-1">Time limit for the entire competition (60-7200 seconds)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={gradeFormData.status}
                    onChange={(e) => setGradeFormData({...gradeFormData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowGradeEditModal(false)} className="flex-1 text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button onClick={handleEditGradeCompetition} className="flex-1 text-xs sm:text-sm">
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