"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Gem, 
  TrendingUp, 
  UserPlus, 
  Copy, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  Settings,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface ReferralStats {
  totalReferrals: number;
  totalRewardsPaid: number;
  pendingRewards: number;
  activeReferrers: number;
}

interface ReferralData {
  id: string;
  referrerName: string;
  referrerEmail: string;
  referredUserName: string;
  referredUserEmail: string;
  referralCode: string;
  status: string;
  gemsAmount: number;
  activityType: string;
  createdAt: string;
  paidAt?: string;
}

interface ReferralSettings {
  gemsPerReferral: number;
  minimumActivityRequired: string;
  autoApprove: boolean;
  activityRewards: {
    practice: number;
    competition: number;
    daily_lesson: number;
    any: number;
  };
}

export default function ReferralsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    totalRewardsPaid: 0,
    pendingRewards: 0,
    activeReferrers: 0
  });
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [settings, setSettings] = useState<ReferralSettings>({
    gemsPerReferral: 10,
    minimumActivityRequired: "practice",
    autoApprove: false,
    activityRewards: {
      practice: 10,
      competition: 15,
      daily_lesson: 8,
      any: 5
    }
  });
  const [newGemsAmount, setNewGemsAmount] = useState(10);

  useEffect(() => {
    if (session && ((session.user as any)?.role === "admin" || (session.user as any)?.role === "ADMIN")) {
      fetchReferralData();
    }
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    } else if (status === "authenticated" && session && ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      // Fetch referral stats
      const statsResponse = await fetch('/api/admin/referrals/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch referral data
      const referralsResponse = await fetch('/api/admin/referrals');
      if (referralsResponse.ok) {
        const referralsData = await referralsResponse.json();
        setReferrals(referralsData);
      }

      // Fetch settings
      const settingsResponse = await fetch('/api/admin/referrals/settings');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
        setNewGemsAmount(settingsData.gemsPerReferral);
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch referral data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const response = await fetch('/api/admin/referrals/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gemsPerReferral: newGemsAmount,
          minimumActivityRequired: settings.minimumActivityRequired,
          autoApprove: settings.autoApprove,
          activityRewards: settings.activityRewards
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Referral settings updated successfully",
        });
        setSettings(prev => ({ ...prev, gemsPerReferral: newGemsAmount }));
      } else {
        toast({
          title: "Error",
          description: "Failed to update settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const handleApproveReward = async (referralId: string) => {
    try {
      const response = await fetch(`/api/admin/referrals/${referralId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Referral reward approved successfully",
        });
        fetchReferralData(); // Refresh data
      } else {
        toast({
          title: "Error",
          description: "Failed to approve reward",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve reward",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-500">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Referral Management
              </h1>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user referrals, track rewards, and configure referral settings.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Referrals</CardTitle>
              <UserPlus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? "..." : stats.totalReferrals}
              </div>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Successful referrals</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Rewards Paid</CardTitle>
              <Gem className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? "..." : stats.totalRewardsPaid.toFixed(2)}
              </div>
              <p className="text-xs text-green-600/70 dark:text-green-400/70">Total gems distributed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending Rewards</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {loading ? "..." : stats.pendingRewards.toFixed(2)}
              </div>
              <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Active Referrers</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {loading ? "..." : stats.activeReferrers}
              </div>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Users with referrals</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="referrals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading referrals...</p>
                  </div>
                ) : referrals.length > 0 ? (
                  <div className="space-y-4">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {referral.referrerName} → {referral.referredUserName}
                              </p>
                              <p className="text-sm text-gray-500">
                                Code: {referral.referralCode}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(referral.status)}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {referral.gemsAmount} gems
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Activity:</span>
                            <span className="ml-2 font-medium capitalize">{referral.activityType}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <span className="ml-2">{formatDate(referral.createdAt)}</span>
                          </div>
                          {referral.paidAt && (
                            <div>
                              <span className="text-gray-500">Paid:</span>
                              <span className="ml-2">{formatDate(referral.paidAt)}</span>
                            </div>
                          )}
                        </div>

                        {referral.status === 'pending' && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Button
                              onClick={() => handleApproveReward(referral.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve Reward
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No referrals found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Referral Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Default Gems per Referral
                    </label>
                    <Input
                      type="number"
                      value={newGemsAmount}
                      onChange={(e) => setNewGemsAmount(Number(e.target.value))}
                      placeholder="10"
                      min="1"
                      max="1000"
                    />
                    <p className="text-xs text-gray-500">
                      Default gems awarded for each successful referral
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Minimum Activity Required
                    </label>
                    <select
                      value={settings.minimumActivityRequired}
                      onChange={(e) => setSettings(prev => ({ ...prev, minimumActivityRequired: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="practice">Practice Question</option>
                      <option value="competition">Competition Entry</option>
                      <option value="daily_lesson">Daily Lesson</option>
                      <option value="any">Any Activity</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Activity required before referral reward is triggered
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Activity-Specific Gem Rewards</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure how many gems referrers earn when their referrals complete different activities
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Practice Questions
                      </label>
                      <Input
                        type="number"
                        value={settings.activityRewards.practice}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          activityRewards: {
                            ...prev.activityRewards,
                            practice: Number(e.target.value)
                          }
                        }))}
                        placeholder="10"
                        min="0"
                        max="1000"
                      />
                      <p className="text-xs text-gray-500">Gems for completing practice questions</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Competition Entry
                      </label>
                      <Input
                        type="number"
                        value={settings.activityRewards.competition}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          activityRewards: {
                            ...prev.activityRewards,
                            competition: Number(e.target.value)
                          }
                        }))}
                        placeholder="15"
                        min="0"
                        max="1000"
                      />
                      <p className="text-xs text-gray-500">Gems for participating in competitions</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Daily Lessons
                      </label>
                      <Input
                        type="number"
                        value={settings.activityRewards.daily_lesson}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          activityRewards: {
                            ...prev.activityRewards,
                            daily_lesson: Number(e.target.value)
                          }
                        }))}
                        placeholder="8"
                        min="0"
                        max="1000"
                      />
                      <p className="text-xs text-gray-500">Gems for watching daily lessons</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Any Activity
                      </label>
                      <Input
                        type="number"
                        value={settings.activityRewards.any}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          activityRewards: {
                            ...prev.activityRewards,
                            any: Number(e.target.value)
                          }
                        }))}
                        placeholder="5"
                        min="0"
                        max="1000"
                      />
                      <p className="text-xs text-gray-500">Gems for any activity completion</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoApprove"
                    checked={settings.autoApprove}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoApprove: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="autoApprove" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Auto-approve referral rewards
                  </label>
                </div>

                <Button onClick={handleUpdateSettings} className="bg-blue-600 hover:bg-blue-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Referral Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Analytics dashboard coming soon</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Track referral trends, conversion rates, and performance metrics
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 