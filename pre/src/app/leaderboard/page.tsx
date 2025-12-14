"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Clock } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Trophy className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              Leaderboard Coming Soon!
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300 pt-2">
              Get ready to climb the ranks!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              We are putting the final touches on our global leaderboard. Soon, you'll be able to see how you stack up against the best and compete for the top spot.
            </p>
            <div className="pt-4">
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}