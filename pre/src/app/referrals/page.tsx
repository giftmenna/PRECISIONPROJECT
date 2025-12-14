"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Copy, 
  Share2, 
  Users, 
  Gem, 
  TrendingUp, 
  Gift, 
  CheckCircle,
  ExternalLink,
  UserPlus,
  Clock,
  Trophy
} from "lucide-react";
import Link from "next/link";

interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
  pendingRewards: number;
  referralCode: string;
}

export default function ReferralsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    totalEarnings: 0,
    pendingRewards: 0,
    referralCode: "PRAW2893" // Placeholder until database is connected
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (session) {
      fetchReferralStats();
    }
  }, [session, status, router]);

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      // TODO: Fetch real data when database is connected
      // const response = await fetch('/api/user/referrals');
      // if (response.ok) {
      //   const data = await response.json();
      //   setStats(data);
      // }
      
      // Placeholder data
      setStats({
        totalReferrals: 3,
        totalEarnings: 30,
        pendingRewards: 10,
        referralCode: "PRAW2893"
      });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(stats.referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/auth/signup?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}/auth/signup?ref=${stats.referralCode}`;
    const text = `Join Precision Academic World and earn gems! Use my referral code: ${stats.referralCode}\n\n${referralLink}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Precision Academic World',
        text: text,
        url: referralLink,
      });
    } else {
      // Fallback to copying
      copyReferralLink();
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

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-500">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Referrals
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your referral code and earn gems when friends join and complete activities!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Referrals</CardTitle>
              <UserPlus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? "..." : stats.totalReferrals}
              </div>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Friends who joined</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Earnings</CardTitle>
              <Gem className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {loading ? "..." : stats.totalEarnings}
              </div>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Gems earned</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending Rewards</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {loading ? "..." : stats.pendingRewards}
              </div>
              <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">Awaiting activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code Section */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Gift className="h-5 w-5 text-emerald-600" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Share this code with friends
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value={stats.referralCode}
                    disabled
                    className="bg-gray-50 dark:bg-gray-700 font-mono text-lg text-center"
                  />
                  <Button onClick={copyReferralCode} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={copyReferralLink} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Referral Link
                </Button>
                <Button onClick={shareReferralLink} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Referral Link
                </Button>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                How to earn gems:
              </h4>
              <ol className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                <li>1. Share your referral code with friends</li>
                <li>2. They sign up using your code</li>
                <li>3. When they complete their first activity, you earn gems!</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              How Referrals Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Share Your Code</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Copy and share your unique referral code with friends and family
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-emerald-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">They Join</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Friends sign up using your referral code and create their account
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">You Earn</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  When they complete their first activity, you automatically earn gems!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/practice">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Start Practicing
                </Button>
              </Link>
              <Link href="/competition">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  <Trophy className="h-4 w-4 mr-2" />
                  Join Competitions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 