"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, CheckCircle, Clock, Award } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LearningModule {
  id: string;
  title: string;
  description: string | null;
  topic: string;
  thumbnailUrl: string | null;
  duration: number;
  gemsReward: number | null;
  isActive: boolean;
  order: number;
  _count: {
    questions: number;
  };
  userProgress?: {
    status: string;
    score: number;
    completedAt: Date | null;
  };
}

export default function LearnPage() {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "in-progress">("all");
  const router = useRouter();

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await fetch("/api/learn");
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = modules.filter(module => {
    if (filter === "all") return true;
    if (filter === "completed") return module.userProgress?.status === "COMPLETED";
    if (filter === "in-progress") return module.userProgress?.status === "IN_PROGRESS";
    return true;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Learning Modules
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Watch videos and complete quizzes to earn gems and improve your skills
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All Modules
          </Button>
          <Button
            variant={filter === "in-progress" ? "default" : "outline"}
            onClick={() => setFilter("in-progress")}
          >
            In Progress
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
        </div>

        {/* Modules Grid */}
        {filteredModules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {filter === "all" 
                  ? "No learning modules available yet. Check back soon!"
                  : `No ${filter} modules found.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <Card 
                key={module.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/learn/${module.id}`)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-200 dark:bg-gray-800">
                  {module.thumbnailUrl ? (
                    <img 
                      src={module.thumbnailUrl} 
                      alt={module.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Play className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  {module.userProgress?.status === "COMPLETED" && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Completed
                    </div>
                  )}
                  {module.userProgress?.status === "IN_PROGRESS" && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                      In Progress
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {module.description || "No description available"}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    {/* Topic */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Topic:</span> {module.topic}
                    </div>

                    {/* Duration & Questions */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(module.duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {module._count.questions} questions
                      </div>
                    </div>

                    {/* Gems Reward */}
                    {module.gemsReward && module.gemsReward > 0 && (
                      <div className="flex items-center gap-1 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        <Award className="h-4 w-4" />
                        {module.gemsReward} gems reward
                      </div>
                    )}

                    {/* Score if completed */}
                    {module.userProgress?.status === "COMPLETED" && (
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        Score: {module.userProgress.score}%
                      </div>
                    )}
                  </div>

                  <Button className="w-full mt-4">
                    {module.userProgress?.status === "COMPLETED" 
                      ? "Review Module"
                      : module.userProgress?.status === "IN_PROGRESS"
                      ? "Continue Learning"
                      : "Start Learning"
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
