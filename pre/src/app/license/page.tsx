"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, FileText, Award, Ban, Copyright, 
  XCircle, Mail, Users, Shield, Lock 
} from "lucide-react";

export default function LicenseAgreement() {
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">License Agreement</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Terms and conditions for using our educational resources
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Section 1 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                1. License Grant
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <span className="font-semibold text-green-600 dark:text-green-400">Precision Academic World (PAW)</span> grants you a <span className="font-semibold">non-exclusive, non-transferable license</span> to use our educational resources subject to these terms. This license allows you to access and utilize our platform for personal educational purposes while maintaining the integrity of our content and systems.
              </p>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Ban className="h-6 w-6 text-red-600 dark:text-red-400" />
                2. Restrictions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">No reverse engineering or decompilation of PAW systems</p>
                </div>
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">No commercial redistribution of materials</p>
                </div>
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">No removal of copyright notices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Copyright className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                3. Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  All content, including but not limited to educational materials, questions, articles, graphics, and software, remains the exclusive property of <span className="font-semibold">Precision Academic World</span>. This license grants you only the right to <span className="font-semibold">access and use</span> the materials for personal educational purposes. No ownership rights are transferred.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                4. Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  This agreement terminates <span className="font-semibold">automatically</span> if you breach any terms outlined herein. Upon termination, you must immediately cease all use of PAW resources and destroy any downloaded materials. PAW reserves the right to terminate access at any time for violations of these terms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                For Complete Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  For complete terms, refer to our <span className="font-semibold">Master Service Agreement</span>.
                </p>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Contact for licensing inquiries:</span>
                </div>
                <a 
                  href="mailto:miraclemarkj@gmail.com" 
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-lg"
                >
                  miraclemarkj@gmail.com
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Related Documents */}
          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                Related Documents
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