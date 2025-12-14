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
  School,
  ArrowLeft,
  Eye,
  DollarSign,
  Target,
  Sparkles
} from "lucide-react";
import Link from "next/link";

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session && (session.user as any).role?.toLowerCase() !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session && (session.user as any).role?.toLowerCase() === "admin") {
      fetchAllCompetitions();
    }
  }, [session]);

  const fetchAllCompetitions = async () => {
    try {
      setLoading(true);
      const [regularRes, gradeRes] = await Promise.all([
        fetch('/api/admin/competitions'),
        fetch('/api/admin/grade-competitions')
      ]);

      if (regularRes.ok) {
        const data = await regularRes.json();
        setRegularCompetitions(data.competitions || []);
      }

      if (gradeRes.ok) {
        const data = await gradeRes.json();
        setGradeCompetitions(data.competitions || []);
      }
    } catch (error) {
      console.error("Error fetching competitions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegularCompetition = async (competitionId: string) => {
    if (!confirm("Are you sure you want to delete this competition?")) return;

    try {
      const response = await fetch(`/api/admin/competitions/${competitionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchAllCompetitions();
      }
    } catch (error) {
      console.error("Error deleting competition:", error);
    }
  };

  const handleDeleteGradeCompetition = async (competitionId: string) => {
    if (!confirm("Are you sure you want to delete this grade competition?")) return;

    try {
      const response = await fetch(`/api/admin/grade-competitions/${competitionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchAllCompetitions();
      }
    } catch (error) {
      console.error("Error deleting grade competition:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'DRAFT': return 'bg-gray-500';
      case 'COMING_SOON': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-purple-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />;
      case 'COMPLETED': return <Trophy className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRegularCompetitions = regularCompetitions.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGradeCompetitions = gradeCompetitions.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading competitions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/dashboard">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Competition Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage competitions for students
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Regular Competitions</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{regularCompetitions.length}</p>
              </div>
              <Trophy className="h-12 w-12 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Grade Competitions</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{gradeCompetitions.length}</p>
              </div>
              <GraduationCap className="h-12 w-12 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Active Now</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {[...regularCompetitions, ...gradeCompetitions].filter(c => c.status === 'ACTIVE').length}
                </p>
              </div>
              <Sparkles className="h-12 w-12 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Entries</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                  {[...regularCompetitions, ...gradeCompetitions].reduce((sum, c) => sum + c._count.entries, 0)}
                </p>
              </div>
              <Users className="h-12 w-12 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search competitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => router.push('/admin/competitions/questions')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Manage Competition Questions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Competition Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Weekly Competition Card */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
            activeTab === 'regular' 
              ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-400 dark:border-yellow-600 shadow-lg' 
              : 'hover:border-yellow-300 dark:hover:border-yellow-700'
          }`}
          onClick={() => setActiveTab('regular')}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-4 rounded-full ${
                activeTab === 'regular' 
                  ? 'bg-yellow-500 dark:bg-yellow-600' 
                  : 'bg-yellow-100 dark:bg-yellow-900/50'
              }`}>
                <Trophy className={`h-8 w-8 ${
                  activeTab === 'regular' 
                    ? 'text-white' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Weekly</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{regularCompetitions.length} competitions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tests Card */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
            activeTab === 'tests' 
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-400 dark:border-blue-600 shadow-lg' 
              : 'hover:border-blue-300 dark:hover:border-blue-700'
          }`}
          onClick={() => setActiveTab('tests')}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-4 rounded-full ${
                activeTab === 'tests' 
                  ? 'bg-blue-500 dark:bg-blue-600' 
                  : 'bg-blue-100 dark:bg-blue-900/50'
              }`}>
                <FileText className={`h-8 w-8 ${
                  activeTab === 'tests' 
                    ? 'text-white' 
                    : 'text-blue-600 dark:text-blue-400'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Tests</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Question sets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exams Card */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
            activeTab === 'exams' 
              ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-400 dark:border-purple-600 shadow-lg' 
              : 'hover:border-purple-300 dark:hover:border-purple-700'
          }`}
          onClick={() => setActiveTab('exams')}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-4 rounded-full ${
                activeTab === 'exams' 
                  ? 'bg-purple-500 dark:bg-purple-600' 
                  : 'bg-purple-100 dark:bg-purple-900/50'
              }`}>
                <School className={`h-8 w-8 ${
                  activeTab === 'exams' 
                    ? 'text-white' 
                    : 'text-purple-600 dark:text-purple-400'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Exams</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grade Competition Card */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
            activeTab === 'grade' 
              ? 'bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 border-green-400 dark:border-green-600 shadow-lg' 
              : 'hover:border-green-300 dark:hover:border-green-700'
          }`}
          onClick={() => setActiveTab('grade')}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-4 rounded-full ${
                activeTab === 'grade' 
                  ? 'bg-green-500 dark:bg-green-600' 
                  : 'bg-green-100 dark:bg-green-900/50'
              }`}>
                <GraduationCap className={`h-8 w-8 ${
                  activeTab === 'grade' 
                    ? 'text-white' 
                    : 'text-green-600 dark:text-green-400'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Grade</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{gradeCompetitions.length} competitions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content (Hidden TabsList) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="hidden">
          <TabsTrigger value="regular">Weekly</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="grade">Grade</TabsTrigger>
        </TabsList>

        {/* Regular Competitions Tab */}
        <TabsContent value="regular" className="space-y-4">
          {filteredRegularCompetitions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm ? 'No competitions match your search.' : 'No regular competitions yet. Create your first one!'}
                </p>
                <Button onClick={() => router.push('/admin/competitions/questions')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Questions
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRegularCompetitions.map((competition) => (
                <Card key={competition.id} className="hover:shadow-lg transition-shadow duration-300 border-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getStatusColor(competition.status)} text-white flex items-center gap-1`}>
                            {getStatusIcon(competition.status)}
                            {competition.status}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {competition.entryType === 'FREE' ? (
                              <><Sparkles className="h-3 w-3" /> FREE</>
                            ) : (
                              <><DollarSign className="h-3 w-3" /> PAID</>
                            )}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl mb-2">{competition.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{competition.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600 dark:text-gray-400">{competition._count.entries} entries</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">{competition._count.drops} drops</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-600 dark:text-gray-400">{competition.timeLimit ? `${Math.floor(competition.timeLimit / 60)}min` : 'No limit'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-gray-600 dark:text-gray-400">₦{competition.prizeCashNgn.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Entry Info */}
                    {competition.entryType === 'PAID' && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-700 dark:text-blue-300 font-medium">Entry Fee:</span>
                          <div className="flex items-center gap-3">
                            {competition.entryPriceNgn && (
                              <span className="text-blue-600 dark:text-blue-400">₦{competition.entryPriceNgn}</span>
                            )}
                            {competition.entryPriceGem && (
                              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                <Gem className="h-3 w-3" />
                                {competition.entryPriceGem}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(competition.startsAt).toLocaleDateString()}
                      </div>
                      <span>→</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(competition.endsAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/competitions/${competition.id}/questions`)}
                        className="flex-1"
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Questions
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRegularCompetition(competition.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Test Management</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Manage test questions and create test sets for your competitions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/tests/questions')}
                  className="bg-white dark:bg-gray-800"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Questions
                </Button>
                <Button 
                  onClick={() => router.push('/admin/test-sets')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Test Sets
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="text-center py-12">
              <School className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Exam Management</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Manage exam questions and create comprehensive assessments for students.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/exams/questions')}
                  className="bg-white dark:bg-gray-800"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Questions
                </Button>
                <Button 
                  onClick={() => router.push('/admin/exams')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <School className="h-4 w-4 mr-2" />
                  Manage Exams
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grade Competitions Tab */}
        <TabsContent value="grade" className="space-y-4">
          {filteredGradeCompetitions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm ? 'No grade competitions match your search.' : 'No grade competitions yet. Create your first one!'}
                </p>
                <Button onClick={() => router.push('/admin/grade-competitions/questions')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Questions
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredGradeCompetitions.map((competition) => (
                <Card key={competition.id} className="hover:shadow-lg transition-shadow duration-300 border-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getStatusColor(competition.status)} text-white flex items-center gap-1`}>
                            {getStatusIcon(competition.status)}
                            {competition.status}
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <School className="h-3 w-3" />
                            {competition.grade}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl mb-2">{competition.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{competition.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600 dark:text-gray-400">{competition._count.entries} entries</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">{competition._count.questions} questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-600 dark:text-gray-400">{competition.timeLimit ? `${Math.floor(competition.timeLimit / 60)}min` : 'No limit'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Gem className="h-4 w-4 text-purple-500" />
                        <span className="text-gray-600 dark:text-gray-400">{competition.entryFee} gems</span>
                      </div>
                    </div>

                    {/* Entry Fee */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-700 dark:text-purple-300 font-medium">Entry Fee:</span>
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <Gem className="h-4 w-4" />
                          {competition.entryFee} gems
                        </span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(competition.startsAt).toLocaleDateString()}
                      </div>
                      <span>→</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(competition.endsAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/grade-competitions/${competition.id}/questions`)}
                        className="flex-1"
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Questions
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteGradeCompetition(competition.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
