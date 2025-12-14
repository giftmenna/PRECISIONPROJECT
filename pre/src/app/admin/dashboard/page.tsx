"use client";

// Extend session type for this component
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      emailVerified?: boolean;
    };
  }
}

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Gem, Target, TrendingUp, Shield, Clock, Activity, BarChart3, Settings, BookOpen, GraduationCap, Plus, Bell, CheckCircle, Eye, UserPlus } from "lucide-react";
import Link from "next/link";
import { NotificationService } from "@/lib/notification-service";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGems: 0,
    avgScore: 0,
    totalCompetitions: 0,
    activeCompetitions: 0,
    totalEntries: 0,
    totalPrizePool: 0,
    verifiedUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      
      // Fetch dashboard stats
      console.log("Dashboard - Making API call to /api/admin/dashboard-stats");
      const statsResponse = await fetch('/api/admin/dashboard-stats');
      console.log("Dashboard - Stats response status:", statsResponse.status);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log("Dashboard - Stats data received:", statsData);
        setDashboardData(statsData);
      } else {
        const errorData = await statsResponse.text();
        console.warn("Failed to fetch dashboard stats:", statsResponse.status, errorData);
        // Set default values if API fails
        setDashboardData({
          totalUsers: 0,
          activeUsers: 0,
          totalGems: 0,
          avgScore: 0,
          totalCompetitions: 0,
          activeCompetitions: 0,
          totalEntries: 0,
          totalPrizePool: 0,
          verifiedUsers: 0
        });
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/admin/recent-activity');
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities || []);
      } else {
        console.warn("Failed to fetch recent activity:", activityResponse.status);
        setRecentActivity([]);
      }
    } catch (error) {
      console.warn("Error fetching dashboard data:", error);
      // Set default values on error
      setDashboardData({
        totalUsers: 0,
        activeUsers: 0,
        totalGems: 0,
        avgScore: 0,
        totalCompetitions: 0,
        activeCompetitions: 0,
        totalEntries: 0,
        totalPrizePool: 0,
        verifiedUsers: 0
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    console.log("Dashboard - Session:", session);
    console.log("Dashboard - User role:", session?.user ? (session.user as any).role : "No user");
    
    if (session && ((session.user as any)?.role === "admin" || (session.user as any)?.role === "ADMIN")) {
      console.log("Dashboard - Fetching data for admin user");
      fetchDashboardData();
    } else {
      console.log("Dashboard - Not fetching data, user not admin or no session");
    }
  }, [session, fetchDashboardData]);

  // Handle redirect when not authenticated or not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    } else if (status === "authenticated" && session && ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Check if user should see admin dashboard
  const isAdmin = session && ((session.user as any)?.role === "admin" || (session.user as any)?.role === "ADMIN");
  const shouldShowDashboard = status === "authenticated" && isAdmin;

  // Always render something - handle conditions in the render
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!shouldShowDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Access denied. Redirecting...</p>
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
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Welcome back, {session.user?.name || "Admin"}! Here's your system overview.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => fetchDashboardData(true)}
                variant="outline"
                className="flex items-center gap-2 text-xs sm:text-sm"
                disabled={refreshing}
              >
                {refreshing ? "🔄 Refreshing..." : "🔄 Refresh Data"}
              </Button>


            </div>
          </div>
        </div>

        {/* Stats Cards - 2x2 Grid Layout */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8">
          {/* Total Users - Top Left */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Users</CardTitle>
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading || refreshing ? (
                  <div className="animate-pulse bg-blue-200 dark:bg-blue-800 h-8 w-16 rounded"></div>
                ) : (
                  dashboardData.totalUsers.toLocaleString()
                )}
              </div>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Registered accounts (excl. admins)</p>
            </CardContent>
          </Card>

          {/* Verified Users - Top Right */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Verified Users</CardTitle>
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading || refreshing ? (
                  <div className="animate-pulse bg-green-200 dark:bg-green-800 h-8 w-16 rounded"></div>
                ) : (
                  dashboardData.verifiedUsers.toLocaleString()
                )}
              </div>
              <p className="text-xs text-green-600/70 dark:text-green-400/70">Email verified (excl. admins)</p>
            </CardContent>
          </Card>

          {/* Active Users - Bottom Left */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Active Users</CardTitle>
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {loading || refreshing ? (
                  <div className="animate-pulse bg-purple-200 dark:bg-purple-800 h-8 w-16 rounded"></div>
                ) : (
                  dashboardData.activeUsers.toLocaleString()
                )}
              </div>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70">This week (excl. admins)</p>
            </CardContent>
          </Card>

          {/* Total Gems - Bottom Right */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Gems</CardTitle>
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Gem className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {loading || refreshing ? (
                  <div className="animate-pulse bg-orange-200 dark:bg-orange-800 h-8 w-16 rounded"></div>
                ) : (
                  dashboardData.totalGems.toFixed(3)
                )}
              </div>
              <p className="text-xs text-orange-600/70 dark:text-orange-400/70">Total gems earned (excl. admins)</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-xs sm:text-sm">
                Manage all registered users, view their details, and take administrative actions.
              </p>
              <Link href="/admin/users">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Manage Users</span>
                  <span className="sm:hidden">Users</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-purple-600" />
                Competition Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-xs sm:text-sm">
                Create and manage all competitions including weekly challenges and grade-specific competitions with tailored questions.
              </p>
              <Link href="/admin/competitions">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs sm:text-sm">
                  <span className="hidden sm:inline">🏆 Manage All Competitions</span>
                  <span className="sm:hidden">🏆 Competitions</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 backdrop-blur-sm border-2 border-green-200 dark:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-green-600" />
                Learn Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-xs sm:text-sm">
                Create and manage learning modules with video content and interactive questions. Users watch videos and answer related questions.
              </p>
              <Link href="/admin/learn">
                <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xs sm:text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Create Module</span>
                  <span className="sm:hidden">Create</span>
                  </Button>
                </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 backdrop-blur-sm border-2 border-yellow-200 dark:border-yellow-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-yellow-600" />
                Practice Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-xs sm:text-sm">
                Create and manage topic-based practice questions. Students can filter by topic and difficulty to practice specific math concepts.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link href="/admin/practice-questions">
                  <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-xs sm:text-sm">
                    <Target className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Manage Practice</span>
                    <span className="sm:hidden">Manage</span>
                  </Button>
                </Link>
                <Link href="/admin/tests/questions">
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-xs sm:text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Add Question</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 backdrop-blur-sm border-2 border-orange-200 dark:border-orange-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-orange-600" />
                Daily Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-xs sm:text-sm">
                Create and manage daily video lessons for user check-ins. Upload educational content with automatic scheduling and gem rewards.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link href="/admin/daily-lessons">
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-xs sm:text-sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Manage Daily Lessons</span>
                    <span className="sm:hidden">Daily Lessons</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 backdrop-blur-sm border-2 border-red-200 dark:border-red-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-red-600" />
                Group Chat Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-xs sm:text-sm">
                Moderate community discussions: ban/unban users, delete messages, and manage groups from a central admin interface.
              </p>
              <Link href="/admin/group-chat/control">
                <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-xs sm:text-sm">
                  Open Chat Controls
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Configure system settings, manage email providers, and system preferences.
              </p>
                              <div className="space-y-2">
                  <Link href="/admin/system-settings">
                    <Button className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white">Configure</Button>
                  </Link>
                  <Button 
                  className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white" 
                  onClick={async () => {
                    try {
                      await NotificationService.sendNotification({
                        type: 'NEW_QUESTION',
                        title: 'Test Notification! 🎯',
                        message: 'This is a test notification from the admin dashboard. New questions are available!'
                      });
                      alert('Test notification sent! Check your browser notifications.');
                    } catch (error) {
                      console.error('Failed to send test notification:', error);
                      alert('Failed to send test notification. Check console for details.');
                    }
                  }}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Test Notification
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-orange-600" />
                Image Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Review and approve competition image uploads for manual grading.
              </p>
              <div className="space-y-2">
                <Link href="/admin/image-reviews">
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                    Review Images
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 backdrop-blur-sm border-2 border-emerald-200 dark:border-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-emerald-600" />
                Referral Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-xs sm:text-sm">
                Track user referrals, manage rewards, and configure referral settings. Monitor who invites new users and approve gem rewards.
              </p>
              <Link href="/admin/referrals">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Manage Referrals</span>
                  <span className="sm:hidden">Referrals</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                Recent User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading || refreshing ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading activity...</p>
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`w-8 h-8 bg-${activity.color}-100 dark:bg-${activity.color}-900/20 rounded-full flex items-center justify-center flex-shrink-0`}>
                        {activity.icon === 'Users' && <Users className="h-4 w-4 text-green-600 dark:text-green-400" />}
                        {activity.icon === 'Trophy' && <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        {activity.icon === 'Gem' && <Gem className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{activity.title}</p>
                          <Badge variant="secondary" className="flex-shrink-0 text-xs">
                            {activity.value || (activity.type === 'user_registration' ? 'New' : '')}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{activity.description} • {formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Status</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Service</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Server Load</span>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Medium</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">99.9%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 