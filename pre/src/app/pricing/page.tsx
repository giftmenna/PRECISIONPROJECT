"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, Star, Crown, Zap, Check, MessageCircle, ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function PricingPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  // Handle payment success redirect from Paystack
  const handlePaymentSuccess = async (reference: string) => {
    setLoading('verifying');
    
    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Payment Successful! 🎉",
          description: `Successfully added ${data.gemsAdded} gems to your wallet.`,
          variant: "default",
        });
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        throw new Error(data.error || "Payment verification failed");
      }

    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "Failed to verify payment",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  // Check for payment success in URL params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentRef = urlParams.get("reference");
    const paymentStatus = urlParams.get("status");

    if (paymentRef && paymentStatus === "success") {
      handlePaymentSuccess(paymentRef);
    }
  }, []);

  const gemPackages = [
    {
      id: "starter",
      name: "Starter Pack",
      gems: 10,
      price: 500,
      originalPrice: 600,
      savings: "17%",
      icon: <Gem className="h-6 w-6 text-white" />,
      color: "from-green-400 to-green-600",
      buttonColor: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      features: ["Perfect for beginners", "Unlock basic features", "Try premium content"]
    },
    {
      id: "popular",
      name: "Popular Pack",
      gems: 25,
      price: 1000,
      originalPrice: 1500,
      savings: "33%",
      icon: <Star className="h-6 w-6 text-white" />,
      color: "from-blue-400 to-blue-600",
      buttonColor: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      features: ["Most popular choice", "Access advanced features", "Join premium competitions"]
    },
    {
      id: "pro",
      name: "Pro Pack",
      gems: 50,
      price: 1800,
      originalPrice: 3000,
      savings: "40%",
      icon: <Zap className="h-6 w-6 text-white" />,
      color: "from-orange-400 to-orange-600",
      buttonColor: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
      features: ["Serious learners", "All premium features", "Priority support"]
    },
    {
      id: "ultimate",
      name: "Ultimate Pack",
      gems: 100,
      price: 3000,
      originalPrice: 6000,
      savings: "50%",
      icon: <Crown className="h-6 w-6 text-white" />,
      color: "from-green-400 to-green-600",
      buttonColor: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      features: ["Best value for money", "Exclusive content access", "VIP community access"]
    }
  ];

  const handlePurchase = async (packageId: string) => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase gems.",
        variant: "destructive",
      });
      return;
    }

    const selectedPackage = gemPackages.find(pkg => pkg.id === packageId);
    if (!selectedPackage) return;

    setLoading(packageId);

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: selectedPackage.price,
          gemAmount: selectedPackage.gems,
          packageName: selectedPackage.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error("No payment URL received");
      }

    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 dark:from-green-900/10 dark:via-blue-900/10 dark:to-orange-900/10">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-12">
            {loading === 'verifying' && (
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying Payment...
              </div>
            )}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Gem className="h-4 w-4" />
              Purchase Gems
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              Boost Your Learning with
              <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
                Premium Gems
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Purchase gems to unlock premium features, participate in exclusive competitions, and enhance your learning experience.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gemPackages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg ${
                    pkg.id === 'popular' ? 'border-2 border-blue-200 dark:border-blue-700' : ''
                  }`}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${pkg.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {pkg.icon}
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">{pkg.name}</CardTitle>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">₦{pkg.price.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{pkg.gems} Gems</div>
                    <div className="text-xs text-green-600 font-semibold">Save {pkg.savings}</div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center justify-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full bg-gradient-to-r ${pkg.buttonColor} text-white`}
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={loading === pkg.id}
                    >
                      {loading === pkg.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Custom Amount & Contact */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Custom Amount */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Custom Amount</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Need a different amount? Let us know!</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="number" 
                      placeholder="Enter gem amount" 
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="1"
                      step="1"
                    />
                    <Button className="bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 hover:from-green-700 hover:via-blue-700 hover:to-orange-700 text-white text-sm sm:text-base whitespace-nowrap">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Contact Us</span>
                      <span className="sm:hidden">Contact</span>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    We'll get back to you within 24 hours with a custom quote.
                  </p>
                </CardContent>
              </Card>

              {/* Benefits Summary */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Gem Benefits</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">What you get with premium gems</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Access to premium practice questions</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Join exclusive competitions</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Unlock advanced analytics</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Priority customer support</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Early access to new features</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Special badges and achievements</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 