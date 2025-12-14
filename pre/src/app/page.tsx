"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Play, BookOpen, Calculator, Users, Star, ArrowRight, Gem, Target, Award, Zap, TrendingUp, Shield, Clock, Youtube, Check, Heart, Crown, Globe, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import LeaderboardWidget from "@/components/LeaderboardWidget";
import { TOPICS } from "@/lib/topics";
import { useState } from "react";

export default function HomePage() {
  const { data: session } = useSession();

  // Local state for custom donation
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [donationEmail, setDonationEmail] = useState<string>("");
  const [donating, setDonating] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const copyToClipboard = async (text: string) => {
    try {
      // Check if we're in a secure context or localhost
      if (!navigator.clipboard) {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } else {
        await navigator.clipboard.writeText(text);
      }
      
      setToastMessage(`Copied: ${text}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setToastMessage('Failed to copy to clipboard');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const startDonation = async () => {
    try {
      const amountNum = Number(donationAmount);
      if (!amountNum || amountNum <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      setDonating(true);

      // If logged in, reuse payments/initialize like pricing (using gems mapping: 1 gem = ₦100 default)
      if (session?.user?.email) {
        const response = await fetch("/api/payments/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountNum,
            gemAmount: amountNum / 100,
            packageName: `Donation ₦${amountNum}`,
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.authorization_url) {
          throw new Error(data.error || "Failed to initialize payment");
        }
        window.location.href = data.authorization_url;
        return;
      }

      // Visitor flow: require email and hit donate-initialize
      if (!donationEmail || !donationEmail.includes("@")) {
        alert("Please enter a valid email to proceed with donation");
        return;
      }

      const response = await fetch("/api/payments/donate-initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(donationAmount), email: donationEmail }),
      });
      const data = await response.json();
      if (!response.ok || !data.authorization_url) {
        throw new Error(data.error || "Failed to initialize donation");
      }
      window.location.href = data.authorization_url;
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to start donation");
    } finally {
      setDonating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* Geometric Patterns */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-orange-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-50" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 px-6 py-3 rounded-full shadow-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  🚀 Trusted by 10,000+ Students Worldwide
                </span>
              </div>
            </div>

            {/* Main Content */}
            <div className="text-center space-y-8 mb-16 lg:mr-96">
              {/* Brand Name */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
                    PRECISION
                  </span>
                </h1>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-orange-600 to-green-600 bg-clip-text text-transparent">
                    ACADEMIC
                  </span>
                </h1>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-orange-600 via-green-600 to-blue-600 bg-clip-text text-transparent">
                    WORLD
                  </span>
                </h1>
              </div>

              {/* Tagline */}
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                  Where Mathematical Excellence
                  <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
                    Meets Innovation
                  </span>
                </h2>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                  Master mathematics through intelligent practice, competitive challenges, and personalized learning paths. 
                  Your journey to mathematical mastery starts here.
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-8 mb-16 lg:mr-96">
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                {session ? (
                  <>
                    <Link href="/dashboard">
                      <Button size="lg" className="group bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 hover:from-green-700 hover:via-blue-700 hover:to-orange-700 text-white px-10 py-4 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 rounded-2xl">
                        <Play className="h-6 w-6 mr-3 group-hover:animate-pulse" />
                        Continue Learning
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/learn">
                      <Button size="lg" className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 px-10 py-4 text-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl text-gray-900 dark:text-white">
                        <BookOpen className="h-6 w-6 mr-3" />
                        Start Learning
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signup">
                      <Button size="lg" className="group bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 hover:from-green-700 hover:via-blue-700 hover:to-orange-700 text-white px-10 py-4 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 rounded-2xl">
                        <Star className="h-6 w-6 mr-3 group-hover:animate-spin" />
                        Start Your Journey
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/auth/login">
                      <Button variant="outline" size="lg" className="border-3 border-gray-300 dark:border-gray-600 px-10 py-4 text-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 rounded-2xl backdrop-blur-sm">
                        <Users className="h-6 w-6 mr-3" />
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Instant Access</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto lg:mr-96 lg:max-w-2xl lg:ml-8">
              <div className="group text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-2xl md:text-3xl font-black text-green-600 dark:text-green-400 mb-1 group-hover:scale-110 transition-transform">500+</div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Math Questions</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Curated & Updated</div>
              </div>
              <div className="group text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform">20+</div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Topics</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Comprehensive</div>
              </div>
              <div className="group text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-2xl md:text-3xl font-black text-orange-600 dark:text-orange-400 mb-1 group-hover:scale-110 transition-transform">24/7</div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Available</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Always Online</div>
              </div>
              <div className="group text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-2xl md:text-3xl font-black text-green-600 dark:text-green-400 mb-1 group-hover:scale-110 transition-transform">100%</div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Free</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">No Hidden Costs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 hidden lg:block">
          <div className="relative z-10">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl max-w-md">
              <Image
                src="/hero-photo.jpg"
                alt="Students learning mathematics"
                width={400}
                height={350}
                className="w-full h-auto object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-1 right-0 sm:top-4 sm:right-4 md:-top-6 md:-right-6 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl md:rounded-2xl p-1 sm:p-2 md:p-4 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-2.5 w-2.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Progress Tracking</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Real-time analytics</div>
                </div>
                <div className="sm:hidden">
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">Progress</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Analytics</div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-1 left-1 sm:bottom-4 sm:left-4 md:-bottom-6 md:-left-6 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl md:rounded-2xl p-1 sm:p-2 md:p-4 shadow-xl border border-gray-200 dark:border-gray-700 m-0 max-w-[calc(100%-8px)] sm:max-w-none overflow-hidden" style={{ maxWidth: 'calc(100% - 8px)', overflow: 'hidden' }}>
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-2.5 w-2.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Secure Learning</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Privacy protected</div>
                </div>
                <div className="sm:hidden min-w-0">
                  <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">Secure</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Learning</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 hidden lg:block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Smart Analytics</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Track your progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-32 left-8 hidden lg:block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full blur-xl opacity-20 animate-pulse delay-1000"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Secure Platform</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Your data is safe</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Hero Photo Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
                  <Zap className="h-4 w-4" />
                  Experience Academic Excellence
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  Join Students
                  <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
                    Mastering Mathematics
                  </span>
                  Every Day
                </h2>
                
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                  See how students are transforming their mathematical skills through our interactive platform. 
                  Real competition, real learning, real results.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">10,000+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active Students</div>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">95%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <Image
                    src="/hero-photo.jpg"
                    alt="Students learning mathematics"
                    width={600}
                    height={500}
                    className="w-full h-auto object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                
                {/* Floating Cards */}
                <div className="absolute -top-1 right-0 sm:top-4 sm:right-4 md:-top-6 md:-right-6 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl md:rounded-2xl p-1 sm:p-2 md:p-4 shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">Progress Tracking</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Real-time analytics</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">Secure Learning</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Privacy protected</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Award className="h-4 w-4" />
              Why Choose Precision Academic World?
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Everything You Need to
              <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
                Master Mathematics
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive learning platform combines cutting-edge technology with proven educational methods 
              to make mathematics engaging, effective, and enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Interactive Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Practice with 160+ carefully crafted math questions across {TOPICS.length} topics. 
                  Get instant feedback and track your progress with real-time analytics.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Weekly Competitions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Compete with other students in weekly competitions. 
                  Test your skills, climb the leaderboard, and win rewards.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Gem className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Gem Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Earn gems for correct answers and achievements. 
                  Build your collection and unlock special features and rewards.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Monitor your learning journey with detailed analytics. 
                  Set goals, track performance, and celebrate your achievements.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calculator className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Math-Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Specialized in mathematics with comprehensive coverage 
                  from basic arithmetic to advanced calculus and beyond.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Achievement System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Unlock badges and achievements as you progress. 
                  Stay motivated with gamified learning experiences and milestones.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* YouTube Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 dark:from-green-900/10 dark:via-blue-900/10 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Youtube className="h-4 w-4" />
              Watch & Learn
            </div>
            <Link href={session ? "/learn" : "/auth/login"}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white cursor-pointer hover:opacity-90">
                Learn Mathematics
                <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
                  Through Video
                </span>
              </h2>
            </Link>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Subscribe to our YouTube channel for comprehensive math tutorials, tips, and tricks
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Video Preview */}
              <div className="relative group">
                <a 
                  href="https://youtube.com/@precisionacademicworld?si=34eBr1a9RWdKCLH4" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer">
                    {/* YouTube Thumbnail */}
                    <div className="aspect-video relative">
                      <Image
                        src="/youtube-placeholder.jpg"
                        alt="Precision Academic World YouTube Channel"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Fallback to local image if placeholder fails
                          e.currentTarget.src = "/youtube-fallback.jpg";
                          e.currentTarget.onerror = null; // Prevent infinite loop
                        }}
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all duration-300">
                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                          <Play className="h-10 w-10 text-white ml-1" fill="white" />
                        </div>
                      </div>
                      {/* YouTube Badge */}
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-2">
                        <Youtube className="h-4 w-4" />
                        WATCH NOW
                      </div>
                    </div>
                  </div>
                </a>
                
                {/* Floating Stats */}
                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">1.2K+</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Subscribers</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Master Math Concepts with Visual Learning
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Our YouTube channel features step-by-step tutorials, problem-solving strategies, 
                    and engaging explanations that make complex mathematical concepts easy to understand.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Step-by-step problem solving</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Visual explanations and diagrams</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Weekly math challenges</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Exam preparation tips</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <a 
                    href="https://www.youtube.com/@precisionacademicworld" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 hover:from-green-700 hover:via-blue-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Youtube className="h-5 w-5" />
                    Subscribe to Our Channel
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Join our community of math learners and never miss a new tutorial!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 dark:from-green-900/10 dark:via-blue-900/10 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Trophy className="h-4 w-4" />
              Weekly Champions
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Meet Our
              <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
                Top Performers
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See who's leading the competition this week and get inspired to climb the leaderboard
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Suspense fallback={
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Trophy className="h-6 w-6 text-orange-500" />
                    Top 5 Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            }>
              <LeaderboardWidget />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Sponsored Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 dark:from-green-900/10 dark:via-blue-900/10 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Heart className="h-4 w-4" />
              Support Our Mission
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Help Us Build
              <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
                The Future of Math Education
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your generous contributions help us maintain and improve our platform, develop new features, 
              and provide free access to quality mathematics education for students worldwide.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Bronze Sponsor */}
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Bronze Supporter</CardTitle>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">₦5,000</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">One-time donation</div>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                    <li className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Support platform maintenance
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Help develop new features
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Keep education free for all
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                    onClick={() => {
                      setDonationAmount("5000");
                      if (session?.user?.email) {
                        startDonation();
                      } else {
                        // For non-logged in users, show a message to use the custom amount section
                        alert("Please enter your email in the custom amount section below to proceed with donation");
                      }
                    }}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Donate ₦5,000
                  </Button>
                </CardContent>
              </Card>

              {/* Silver Sponsor */}
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg border-2 border-blue-200 dark:border-blue-700">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Silver Supporter</CardTitle>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">₦10,000</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">One-time donation</div>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                    <li className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      All Bronze benefits
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Priority feature requests
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Name on supporters page
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    onClick={() => {
                      setDonationAmount("10000");
                      if (session?.user?.email) {
                        startDonation();
                      } else {
                        // For non-logged in users, show a message to use the custom amount section
                        alert("Please enter your email in the custom amount section below to proceed with donation");
                      }
                    }}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Donate ₦10,000
                  </Button>
                </CardContent>
              </Card>

              {/* Gold Sponsor */}
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg border-2 border-green-200 dark:border-green-700">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Gold Supporter</CardTitle>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">₦15,000</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">One-time donation</div>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                    <li className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      All Silver benefits
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Exclusive supporter badge
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Direct input on new features
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    onClick={() => {
                      setDonationAmount("15000");
                      if (session?.user?.email) {
                        startDonation();
                      } else {
                        // For non-logged in users, show a message to use the custom amount section
                        alert("Please enter your email in the custom amount section below to proceed with donation");
                      }
                    }}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Donate ₦15,000
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Custom Amount */}
            <div className="mt-12 text-center">
              <Card className="max-w-md mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Custom Amount</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose your own donation amount</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input 
                      type="number" 
                      placeholder="Enter amount (₦)" 
                      className="flex-1"
                      min="1"
                      step="1"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                    />
                    {!session?.user?.email && (
                      <Input
                        type="email"
                        placeholder="Your email"
                        className="flex-1"
                        value={donationEmail}
                        onChange={(e) => setDonationEmail(e.target.value)}
                      />
                    )}
                    <Button onClick={startDonation} disabled={donating} className="bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 hover:from-green-700 hover:via-blue-700 hover:to-orange-700 text-white whitespace-nowrap">
                      <Heart className="h-4 w-4 mr-2" />
                      {donating ? "Processing..." : "Donate"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Every contribution helps us continue our mission of making quality math education accessible to everyone.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Why Support Us */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Free for Everyone</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We believe quality education should be accessible to all students, regardless of their financial situation.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Continuous Improvement</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your support helps us develop new features, improve existing ones, and maintain high-quality content.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Global Impact</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help us reach more students worldwide and make a positive impact on mathematics education globally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Testimonials Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Star className="h-4 w-4" />
              Success Stories
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              What Our Students
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Are Saying
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real stories from students who transformed their math journey with Precision Academic World
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Testimonial 1 */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-2xl border-2 border-purple-200 dark:border-purple-800 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                "
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <Image
                    src="/3.jpg"
                    alt="Adebayo Oluwaseun"
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-200 dark:ring-purple-800"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">Adebayo Oluwaseun</h4>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Grade 10 Student</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic mb-4">
                "Before joining PAW, I struggled with algebra and feared math exams. Now, I'm scoring 95%+ consistently! The daily practice and video tutorials made complex concepts so easy to understand. Best decision ever!"
              </p>
              <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-semibold">
                <Trophy className="h-4 w-4" />
                <span>Improved from 62% to 95%</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-8 rounded-2xl border-2 border-blue-200 dark:border-blue-800 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                "
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <Image
                    src="/4.jpg"
                    alt="Chioma Nwosu"
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-200 dark:ring-blue-800"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">Chioma Nwosu</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">SS3 Student, Lagos</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic mb-4">
                "The competition feature is amazing! It motivated me to practice daily and compete with students across Nigeria. I won my first weekly competition and earned enough gems to unlock premium content. Math is now my favorite subject!"
              </p>
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold">
                <Award className="h-4 w-4" />
                <span>3x Weekly Champion</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-2xl border-2 border-green-200 dark:border-green-800 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                "
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <Image
                    src="/3.jpg"
                    alt="Emmanuel Musa"
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-green-200 dark:ring-green-800"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">Emmanuel Musa</h4>
                  <p className="text-sm text-green-600 dark:text-green-400">JSS2 Student, Abuja</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic mb-4">
                "My parents were worried about my math grades. After 3 months on PAW, I went from bottom of my class to top 5! The step-by-step explanations and practice questions are perfect. Thank you PAW!"
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span>Top 5 in Class</span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">50K+</div>
              <div className="text-gray-600 dark:text-gray-400">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">95%</div>
              <div className="text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">1M+</div>
              <div className="text-gray-600 dark:text-gray-400">Questions Solved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">4.9/5</div>
              <div className="text-gray-600 dark:text-gray-400">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Users className="h-4 w-4" />
              Trusted Partners
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Partnering with
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Educational Leaders
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Collaborating with top institutions and organizations to deliver world-class mathematics education
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-16">
            {/* Partner 1 */}
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  UN
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">UNESCO</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    SDG4 Education Initiative Partner
                  </p>
                  <div className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
                    <Check className="h-3 w-3" />
                    Verified Partner
                  </div>
                </div>
              </div>
            </div>

            {/* Partner 2 */}
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  NV
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">NVIDIA</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    AI-Powered Learning Technology
                  </p>
                  <div className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                    <Check className="h-3 w-3" />
                    Tech Partner
                  </div>
                </div>
              </div>
            </div>

            {/* Partner 3 */}
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  WR
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Wolfram Research</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Computational Mathematics Tools
                  </p>
                  <div className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-semibold">
                    <Check className="h-3 w-3" />
                    Content Partner
                  </div>
                </div>
              </div>
            </div>

            {/* Partner 4 */}
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  NE
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Nigerian Educators</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    National Curriculum Alignment
                  </p>
                  <div className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-semibold">
                    <Check className="h-3 w-3" />
                    Official Partner
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Partner Logos Ticker */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6 font-semibold">
              Trusted by leading schools and institutions across Nigeria
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="text-gray-400 dark:text-gray-600 font-bold text-lg">University of Lagos</div>
              <div className="text-gray-400 dark:text-gray-600 font-bold text-lg">Covenant University</div>
              <div className="text-gray-400 dark:text-gray-600 font-bold text-lg">Federal Ministry of Education</div>
              <div className="text-gray-400 dark:text-gray-600 font-bold text-lg">WAEC</div>
              <div className="text-gray-400 dark:text-gray-600 font-bold text-lg">JAMB</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                <Zap className="h-4 w-4" />
                Start Your Journey Today
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Ready to Transform Your
                <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
                  Math Skills?
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Join thousands of students who are already improving their math skills with Precision Academic World. 
                Your mathematical excellence journey starts now.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Link href="/learn">
                  <Button size="lg" className="bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 hover:from-green-700 hover:via-blue-700 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Play className="h-6 w-6 mr-2" />
                    Start Learning Now
                    <ArrowRight className="h-6 w-6 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 hover:from-green-700 hover:via-blue-700 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Star className="h-6 w-6 mr-2" />
                    Get Started Free
                    <ArrowRight className="h-6 w-6 ml-2" />
                  </Button>
                </Link>
              )}
            </div>

            <div className="mt-12 text-center space-y-4">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">These are our contact information:</p>
              <div className="flex items-center justify-center gap-2">
                <span>precisionacademicw@gmail.com</span>
                <button onClick={() => copyToClipboard('precisionacademicw@gmail.com')} className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>miraclemarkj@gmail.com</span>
                <button onClick={() => copyToClipboard('miraclemarkj@gmail.com')} className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>+2347012897573</span>
                <button onClick={() => copyToClipboard('+2347012897573')} className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {showToast && (
        <div className="fixed bottom-4 right-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
