"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Lock, Database, Shield, Eye, Users, 
  FileText, Mail, Bell, Settings 
} from "lucide-react";

export default function PrivacyPolicy() {
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Your privacy and data security are our top priorities
            </p>
          </div>
        </div>

        {/* Introduction */}
        <Card className="border-2 mb-6">
          <CardContent className="pt-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
              At <span className="font-semibold text-blue-600 dark:text-blue-400">Precision Academic World</span> ("we," "our," or "us"), we are committed to protecting the privacy
              of students, educators, and all users of precisionaw.org.
              This policy outlines how we collect, use, and safeguard your information.
            </p>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-6">

          {/* Section 1 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  a) Personal Data:
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1">•</Badge>
                    <p className="text-gray-700 dark:text-gray-300">Names, email addresses, and contact details (provided during account creation or inquiries)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1">•</Badge>
                    <p className="text-gray-700 dark:text-gray-300">Age/grade level (to tailor educational content appropriately)</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  b) Non-Personal Data:
                </h3>
                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1">•</Badge>
                    <p className="text-gray-700 dark:text-gray-300">Browser type, IP address, and device information (via cookies)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1">•</Badge>
                    <p className="text-gray-700 dark:text-gray-300">Usage patterns (e.g., pages visited, interaction with math questions or articles)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Settings className="h-6 w-6 text-green-600 dark:text-green-400" />
                2. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">a) Purpose:</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <Badge variant="outline" className="mt-1">✓</Badge>
                    <p className="text-gray-700 dark:text-gray-300">To provide educational resources, including math questions and articles</p>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <Badge variant="outline" className="mt-1">✓</Badge>
                    <p className="text-gray-700 dark:text-gray-300">To facilitate engagement with the platform for learning purposes</p>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <Badge variant="outline" className="mt-1">✓</Badge>
                    <p className="text-gray-700 dark:text-gray-300">To send updates about new content or services (with consent)</p>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <Badge variant="outline" className="mt-1">✓</Badge>
                    <p className="text-gray-700 dark:text-gray-300">To improve website functionality and user experience</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">b) Legal Basis:</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Data is collected only for educational and engagement purposes, as stated in our{" "}
                  <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Terms and Conditions
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                3. Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
                  <div className="text-3xl mb-2">🔒</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Security Measures</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">We implement SSL encryption and secure servers to protect your data</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg">
                  <div className="text-3xl mb-2">🤝</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sharing Policy</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Personal information will not be shared with third parties without consent, except as required by law</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg">
                  <div className="text-3xl mb-2">⏱️</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Data Retention</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Data is retained only as long as necessary for educational purposes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                4. Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">a) Analytics:</h3>
                <p className="text-gray-700 dark:text-gray-300">We may use tools like Google Analytics for usage analysis</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">b) Compliance:</h3>
                <p className="text-gray-700 dark:text-gray-300">Any third-party services adhere to strict privacy standards</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Lock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                5. Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">You may:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                  <Badge variant="outline" className="mt-1">✓</Badge>
                  <p className="text-gray-700 dark:text-gray-300">Request access to or deletion of your personal data</p>
                </div>
                <div className="flex items-start gap-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                  <Badge variant="outline" className="mt-1">✓</Badge>
                  <p className="text-gray-700 dark:text-gray-300">Opt out of non-essential communications</p>
                </div>
                <div className="flex items-start gap-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                  <Badge variant="outline" className="mt-1">✓</Badge>
                  <p className="text-gray-700 dark:text-gray-300">Contact us to exercise these rights at the details below</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 - Contact */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Mail className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                6. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">For privacy-related inquiries, reach us at:</p>
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

          {/* Section 7 */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Bell className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                7. Policy Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Changes will be posted on this page. Continued use of our services implies acceptance.
                View the current version at:{" "}
                <a href="https://precisionaw.org/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  https://precisionaw.org/privacy
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 