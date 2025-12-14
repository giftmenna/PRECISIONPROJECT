"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  Search,
  Filter,
  Download,
  User,
  Calendar
} from "lucide-react";

interface ImageUpload {
  id: string;
  competitionId: string;
  userId: string;
  questionId: string;
  imageUrl: string;
  uploadedAt: string;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  isCorrect?: boolean;
  competition: {
    name: string;
  };
  user: {
    name: string;
    email: string;
  };
  question: {
    question: string;
    topic: string;
  };
}

export default function ImageReviewsPage() {
  const [imageUploads, setImageUploads] = useState<ImageUpload[]>([]);
  const [filteredUploads, setFilteredUploads] = useState<ImageUpload[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedImage, setSelectedImage] = useState<ImageUpload | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImageUploads();
  }, []);

  useEffect(() => {
    filterUploads();
  }, [imageUploads, searchTerm, statusFilter]);

  const fetchImageUploads = async () => {
    try {
      const response = await fetch('/api/admin/image-reviews');
      if (response.ok) {
        const data = await response.json();
        setImageUploads(data.imageUploads);
      }
    } catch (error) {
      console.error('Error fetching image uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUploads = () => {
    let filtered = imageUploads;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(upload => 
        upload.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        upload.competition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        upload.question.topic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(upload => upload.reviewStatus === statusFilter);
    }

    setFilteredUploads(filtered);
  };

  const handleReview = async (status: 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW') => {
    if (!selectedImage) return;

    try {
      const response = await fetch(`/api/admin/image-reviews/${selectedImage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewStatus: status,
          reviewNotes,
          isCorrect: status === 'APPROVED' ? isCorrect : null
        })
      });

      if (response.ok) {
        // Update local state
        setImageUploads(prev => prev.map(upload => 
          upload.id === selectedImage.id 
            ? { ...upload, reviewStatus: status, reviewNotes, isCorrect }
            : upload
        ));
        
        setSelectedImage(null);
        setReviewNotes("");
        setIsCorrect(null);
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      APPROVED: { color: "bg-green-100 text-green-800", icon: Check },
      REJECTED: { color: "bg-red-100 text-red-800", icon: X },
      NEEDS_REVIEW: { color: "bg-orange-100 text-orange-800", icon: Eye }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getStatusCounts = () => {
    const counts = {
      ALL: imageUploads.length,
      PENDING: imageUploads.filter(u => u.reviewStatus === 'PENDING').length,
      APPROVED: imageUploads.filter(u => u.reviewStatus === 'APPROVED').length,
      REJECTED: imageUploads.filter(u => u.reviewStatus === 'REJECTED').length,
      NEEDS_REVIEW: imageUploads.filter(u => u.reviewStatus === 'NEEDS_REVIEW').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading image reviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Image Review Management</h1>
        <p className="text-gray-600">Review and approve/reject competition image uploads</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-gray-600">{status.replace('_', ' ')}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by user, competition, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
          </select>
        </div>
      </div>

      {/* Image Uploads List */}
      <div className="grid gap-4">
        {filteredUploads.map((upload) => (
          <Card key={upload.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{upload.competition.name}</h3>
                    {getStatusBadge(upload.reviewStatus)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{upload.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {new Date(upload.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Topic: {upload.question.topic}
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 mb-3">
                    <strong>Question:</strong> {upload.question.question}
                  </div>

                  {upload.reviewNotes && (
                    <div className="text-sm text-gray-600 mb-3">
                      <strong>Review Notes:</strong> {upload.reviewNotes}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedImage(upload)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                  
                  {upload.reviewStatus === 'PENDING' && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleReview('APPROVED')}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleReview('REJECTED')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Review Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Review Image Upload</h2>
              <Button
                variant="outline"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Display */}
              <div>
                <h3 className="font-semibold mb-2">Uploaded Image</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img
                    src={selectedImage.imageUrl}
                    alt="Uploaded solution"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              </div>

              {/* Review Form */}
              <div>
                <h3 className="font-semibold mb-2">Review Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Is the answer correct?</label>
                    <div className="flex gap-2">
                      <Button
                        variant={isCorrect === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsCorrect(true)}
                      >
                        Correct
                      </Button>
                      <Button
                        variant={isCorrect === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsCorrect(false)}
                      >
                        Incorrect
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Review Notes</label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add review notes..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReview('APPROVED')}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isCorrect === null}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReview('REJECTED')}
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleReview('NEEDS_REVIEW')}
                      variant="outline"
                    >
                      Needs Review
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 