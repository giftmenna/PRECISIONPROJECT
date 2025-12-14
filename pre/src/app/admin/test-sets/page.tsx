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
  FileText,
  BookOpen
} from "lucide-react";

interface TestSet {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  _count: {
    questions: number;
  };
}

export default function AdminTestSetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [testSets, setTestSets] = useState<TestSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTestSet, setSelectedTestSet] = useState<TestSet | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
      router.push("/auth/login");
      return;
    }

    fetchTestSets();
  }, [session, status, router]);

  const fetchTestSets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/test-sets');
      if (response.ok) {
        const data = await response.json();
        setTestSets(data.testSets || []);
      }
    } catch (error) {
      console.error("Error fetching test sets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestSet = async () => {
    try {
      const response = await fetch('/api/admin/test-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to create test set");

      setShowCreateModal(false);
      setFormData({ name: "", description: "" });
      fetchTestSets();
    } catch (error) {
      console.error("Error creating test set:", error);
    }
  };

  const handleEditTestSet = async () => {
    if (!selectedTestSet) return;

    try {
      const response = await fetch(`/api/admin/test-sets/${selectedTestSet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to update test set");

      setShowEditModal(false);
      fetchTestSets();
    } catch (error) {
      console.error("Error updating test set:", error);
    }
  };

  const handleDeleteTestSet = async (testSetId: string) => {
    if (!confirm("Are you sure you want to delete this test set? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/test-sets/${testSetId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error("Failed to delete test set");

      fetchTestSets();
    } catch (error) {
      console.error("Error deleting test set:", error);
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
                Test Sets Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Create and manage test sets for competitions and assessments.
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
                onClick={fetchTestSets}
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
                placeholder="Search test sets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs sm:text-sm w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create Test Set</span>
            <span className="sm:hidden">Create Test Set</span>
          </Button>
        </div>

        {/* Test Sets List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading test sets...</p>
          </div>
        ) : testSets.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Test Sets</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first test set to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testSets
              .filter(testSet => testSet.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((testSet) => (
              <Card key={testSet.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{testSet.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testSet.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Created: {formatDateTime(testSet.createdAt)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>{testSet._count.questions} questions</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTestSet(testSet);
                        setFormData({
                          name: testSet.name,
                          description: testSet.description
                        });
                        setShowEditModal(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/test-sets/${testSet.id}/questions`)}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Questions
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTestSet(testSet.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create Test Set</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Test set name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Test set description"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateTestSet} className="flex-1">
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit Test Set</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Test set name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Test set description"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleEditTestSet} className="flex-1">
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