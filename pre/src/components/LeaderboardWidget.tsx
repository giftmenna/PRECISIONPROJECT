"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
}

export default function LeaderboardWidget() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Trophy className="mx-auto h-16 w-16 text-yellow-400 animate-pulse" />
          <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Coming Soon!
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Our global leaderboard is under construction. Get ready to see where you stand!
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 