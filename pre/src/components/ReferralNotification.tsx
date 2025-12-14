"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralNotificationProps {
  referrerName: string;
  referredUserName: string;
  gemsAmount: number;
  activityType: string;
  onDismiss?: () => void;
}

export default function ReferralNotification({
  referrerName,
  referredUserName,
  gemsAmount,
  activityType,
  onDismiss
}: ReferralNotificationProps) {
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'practice':
        return '🎯';
      case 'competition':
        return '🏆';
      case 'daily_lesson':
        return '📚';
      default:
        return '🎉';
    }
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case 'practice':
        return 'completed a practice question';
      case 'competition':
        return 'participated in a competition';
      case 'daily_lesson':
        return 'watched a daily lesson';
      default:
        return 'completed an activity';
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700 shadow-lg animate-in slide-in-from-top-2 duration-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Gift className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">
                  Referral Reward Earned! 🎉
                </h4>
                <Badge variant="default" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                  +{gemsAmount} gems
                </Badge>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                <span className="font-medium">{referredUserName}</span> {getActivityText(activityType)} {getActivityIcon(activityType)}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Thanks for inviting them to join Precision Academic World!
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 