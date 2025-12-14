"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, FileText, Users, Lock, AlertTriangle, Scale, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Please read these terms carefully before using Precision Academic World
            </p>
          </div>
        </div>

        {/* Terms Content */}
        <div className="space-y-6">
          {/* Section 1 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By accessing and using <span className="font-semibold text-blue-600 dark:text-blue-400">precisionaw.org</span>, you agree to comply with these Terms and Conditions. If you do not agree with any part of these terms, please do not use the Website.
              </p>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                2. Use of the Website
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The Website is intended for students, educators, and math enthusiasts to learn, practice math questions, and read related articles.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-1">✓</Badge>
                  <p className="text-gray-700 dark:text-gray-300">You may not use the Website for any unlawful purpose or to engage in activities that violate academic integrity.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-1">✓</Badge>
                  <p className="text-gray-700 dark:text-gray-300">Users must provide accurate and truthful information when creating accounts or engaging with the platform.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                3. Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                All content, including but not limited to math questions, articles, and resources, is the property of <span className="font-semibold">Precision Academic World</span> unless otherwise stated.
                Users may use the materials for personal learning but are prohibited from copying, distributing, or modifying them without permission. Usage is governed by our{" "}
                <Link href="/license" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  License Agreement
                </Link>.
              </p>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                4. User Conduct
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Users must engage respectfully and constructively within the Website/community.
              </p>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">❌ Prohibited Actions:</h3>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                    <p className="text-gray-700 dark:text-gray-300">Any form of cheating, sharing of examination answers, or academic dishonesty is strictly prohibited.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                    <p className="text-gray-700 dark:text-gray-300">No uploading of malicious content.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                    <p className="text-gray-700 dark:text-gray-300">No sharing of login credentials.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">⚠️ Consequences:</h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">
                    precisionaw.org reserves the right to suspend or ban users who violate these terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Lock className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                5. Privacy and Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The Website collects user data only for educational and engagement purposes.
                Personal information will not be shared with third parties without consent, except as required by law. See our{" "}
                <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Privacy Policy
                </Link>{" "}
                for more details.
              </p>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <AlertTriangle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                6. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The Website provides educational resources <span className="font-semibold">"as is"</span> without guarantees of accuracy or completeness.
                The Website is not responsible for any loss, damage, or academic outcomes resulting from its use, including technical errors or indirect damages.
              </p>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                7. Modifications to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The Website reserves the right to update these Terms and Conditions at any time.
                Continued use of the Website after changes are made constitutes acceptance of the updated terms.
              </p>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Scale className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                8. Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <span className="font-semibold">Nigerian law</span> applies to these Terms and Conditions.
              </p>
            </CardContent>
          </Card>

          {/* Section 9 - Contact */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                9. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                For any inquiries regarding these terms, please contact:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email</p>
                  <p className="text-gray-900 dark:text-white font-medium">📧 precisionacademicw@gmail.com</p>
                  <p className="text-gray-900 dark:text-white font-medium">📧 miraclemarkj@gmail.com</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Social</p>
                  <p className="text-gray-900 dark:text-white font-medium">📱 WhatsApp: +2347012897573</p>
                  <a href="https://youtube.com/@precisionacademicworld?si=34eBr1a9RWdKCLH4" target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    📺 YouTube: @Precision Academic World
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Documentation */}
          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                Legal Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/about">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-white dark:hover:bg-gray-800">
                    <Users className="h-6 w-6" />
                    <span>About PAW</span>
                  </Button>
                </Link>
                <Link href="/license">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-white dark:hover:bg-gray-800">
                    <FileText className="h-6 w-6" />
                    <span>License Agreement</span>
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