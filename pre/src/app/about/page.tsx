"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, BookOpen, Heart, Users, Target, TrendingUp, 
  Award, Globe, Shield, Sparkles, FileText, Lock 
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/1.jpg"
                alt="Precision Academic World"
                width={80}
                height={80}
                className="h-20 w-auto rounded-lg"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">About Precision Academic World</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Empowering students worldwide through innovative mathematics education
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Our Story */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                Our Story
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Founded in <span className="font-semibold text-blue-600 dark:text-blue-400">2020</span> by a team of mathematics educators and tech innovators, Precision Academic World (PAW) emerged from a shared concern about declining mathematical proficiency and growing academic dishonesty. What began as local math olympiads in Lagos, Nigeria, has grown into an international movement spanning <span className="font-semibold">12 countries</span>, impacting over <span className="font-semibold">50,000 students</span> annually.
              </p>
            </CardContent>
          </Card>

          {/* Core Values */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                Core Values
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Integrity First</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">We maintain zero tolerance for examination malpractice</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Innovative Pedagogy</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">Our AI-powered learning platform adapts to individual student needs</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Global Community</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">Connecting students across 35+ countries through mathematics</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Sustainable Education</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">20% of profits fund rural STEM initiatives</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Sets Us Apart */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                What Sets Us Apart
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Unlike traditional academic organizations, PAW combines:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <Badge variant="outline" className="mt-1">✓</Badge>
                  <p className="text-gray-700 dark:text-gray-300">Cutting-edge competition platforms with real-time cheating detection</p>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <Badge variant="outline" className="mt-1">✓</Badge>
                  <p className="text-gray-700 dark:text-gray-300">Gamified learning modules aligned with national curricula</p>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <Badge variant="outline" className="mt-1">✓</Badge>
                  <p className="text-gray-700 dark:text-gray-300">Industry partnerships with tech giants like NVIDIA and Wolfram Research</p>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <Badge variant="outline" className="mt-1">✓</Badge>
                  <p className="text-gray-700 dark:text-gray-300">Annual Global Math Summit featuring Fields Medalists</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Milestones */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                Key Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <h3 className="font-bold text-2xl text-blue-600 dark:text-blue-400 mb-2">2021</h3>
                  <p className="text-gray-700 dark:text-gray-300">Launched first anti-cheating certification program</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-800">
                  <h3 className="font-bold text-2xl text-green-600 dark:text-green-400 mb-2">2022</h3>
                  <p className="text-gray-700 dark:text-gray-300">Partnered with UNESCO on SDG4 Education Initiative</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                  <h3 className="font-bold text-2xl text-purple-600 dark:text-purple-400 mb-2">2023</h3>
                  <p className="text-gray-700 dark:text-gray-300">Reached 1 million lesson completions on our platform</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                  <h3 className="font-bold text-2xl text-orange-600 dark:text-orange-400 mb-2">2024</h3>
                  <p className="text-gray-700 dark:text-gray-300">Introduced blockchain-certified academic credentials</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Our Commitment */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                Our Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Every resource we create adheres to strict <span className="font-semibold">Quality Standards</span> and undergoes triple review by our panel of:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2">🎓</div>
                  <p className="font-semibold text-gray-900 dark:text-white">Mathematics PhDs</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">From top universities</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2">🧠</div>
                  <p className="font-semibold text-gray-900 dark:text-white">Psychology Specialists</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Child development experts</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2">🔒</div>
                  <p className="font-semibold text-gray-900 dark:text-white">Cybersecurity Experts</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Platform security</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Framework */}
          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                Legal Framework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/license">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-white dark:hover:bg-gray-800">
                    <FileText className="h-6 w-6" />
                    <span>License Agreements</span>
                  </Button>
                </Link>
                <Link href="/terms">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-white dark:hover:bg-gray-800">
                    <Shield className="h-6 w-6" />
                    <span>Terms of Service</span>
                  </Button>
                </Link>
                <Link href="/privacy">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-white dark:hover:bg-gray-800">
                    <Lock className="h-6 w-6" />
                    <span>Privacy Policy</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 