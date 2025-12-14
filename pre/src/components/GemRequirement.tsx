"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gem, AlertTriangle, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface GemRequirementProps {
  requiredGems: number;
  userGems: number;
  questionId: string;
  onProceed?: () => void;
}

export default function GemRequirement({ 
  requiredGems, 
  userGems, 
  questionId, 
  onProceed 
}: GemRequirementProps) {
  const hasEnoughGems = userGems >= requiredGems;
  const gemsNeeded = requiredGems - userGems;

  if (hasEnoughGems) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gem className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Sufficient Gems: {userGems} / {requiredGems}
              </span>
            </div>
            {onProceed && (
              <Button 
                onClick={onProceed}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Start Question
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Insufficient Gems
            </span>
          </div>
          
          <div className="text-sm text-amber-700 dark:text-amber-300">
            <p>You need <strong>{requiredGems} gems</strong> to attempt this question.</p>
            <p>You currently have <strong>{userGems} gems</strong>.</p>
            <p>You need <strong>{gemsNeeded} more gems</strong>.</p>
          </div>

          <div className="flex gap-2">
            <Link href="/pricing">
              <Button 
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy Gems
              </Button>
            </Link>
            
            <Badge variant="outline" className="text-amber-700 border-amber-300">
              <Gem className="h-3 w-3 mr-1" />
              {requiredGems} gems required
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 