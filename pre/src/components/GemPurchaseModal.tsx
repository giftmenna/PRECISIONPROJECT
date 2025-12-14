"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gem, CreditCard, CheckCircle, X, Loader2, Star, Crown, Zap } from "lucide-react";

const PAYSTACK_PUBLIC_KEY = "pk_test_e6cfaef0ed04cd36c5b0b16f0f752afb3c44d664";

const gemPackages = [
  { id: "starter", name: "Starter Pack", gems: 10, price: 500, icon: <Gem className="h-5 w-5 text-blue-500" /> },
  { id: "popular", name: "Popular Pack", gems: 25, price: 1000, popular: true, icon: <Star className="h-5 w-5 text-yellow-500" /> },
  { id: "pro", name: "Pro Pack", gems: 50, price: 1800, bestValue: true, icon: <Crown className="h-5 w-5 text-purple-500" /> },
  { id: "premium", name: "Premium Pack", gems: 100, price: 3000, icon: <Zap className="h-5 w-5 text-orange-500" /> },
];

interface GemPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (gemsAdded: number) => void;
}

export default function GemPurchaseModal({ isOpen, onClose, onSuccess }: GemPurchaseModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!selectedPackage || !session?.user) {
      toast({
        title: "Error",
        description: "Please select a package and ensure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    setPaymentLoading(true);

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setPaymentLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Gem className="h-6 w-6 text-blue-500" />
            Purchase Gems
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading || paymentLoading}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Choose a gem package to enhance your learning experience</p>
            <p className="text-sm text-gray-500">Gems can be used to enter competitions and unlock premium features</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gemPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedPackage?.id === pkg.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {pkg.icon}
                      <h3 className="font-semibold">{pkg.name}</h3>
                    </div>
                    {pkg.popular && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Popular</Badge>}
                    {pkg.bestValue && <Badge variant="secondary" className="bg-purple-100 text-purple-800">Best Value</Badge>}
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{pkg.gems} Gems</div>
                    <div className="text-lg font-semibold text-gray-900">₦{pkg.price.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 mt-1">₦{(pkg.price / pkg.gems).toFixed(0)} per gem</div>
                  </div>

                  {selectedPackage?.id === pkg.id && (
                    <div className="flex items-center justify-center mt-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="ml-1 text-sm text-green-600">Selected</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPackage && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Order Summary</h4>
              <div className="flex justify-between items-center">
                <span>{selectedPackage.name}</span>
                <span className="font-semibold">₦{selectedPackage.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">Gems to receive</span>
                <span className="font-semibold text-blue-600">{selectedPackage.gems} Gems</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading || paymentLoading}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={!selectedPackage || loading || paymentLoading} className="flex-1">
              {paymentLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ₦{selectedPackage?.price.toLocaleString() || "0"}
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>Secure payment powered by Paystack</p>
            <p>Test mode - No real charges will be made</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 