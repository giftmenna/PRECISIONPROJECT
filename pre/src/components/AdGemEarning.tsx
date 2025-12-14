"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gem, Play, Eye, Gift, Clock, ExternalLink } from "lucide-react";
import { AD_LINKS, AD_SETTINGS } from "@/lib/ad-config";

interface AdGemEarningProps {
  userGems?: number;
  onGemsEarned?: (newGems: number) => void;
}

export default function AdGemEarning({ userGems = 0, onGemsEarned }: AdGemEarningProps) {
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [canWatchAd, setCanWatchAd] = useState(true);
  const [lastWatchTime, setLastWatchTime] = useState<number | null>(null);
  const [adWindow, setAdWindow] = useState<Window | null>(null);

  // Check if user can watch ad (once every hour)
  const checkAdAvailability = () => {
    if (!lastWatchTime) return true;
    const timeSinceLastWatch = Date.now() - lastWatchTime;
    return timeSinceLastWatch >= AD_SETTINGS.cooldown;
  };

  const startWatchingAd = async () => {
    if (!checkAdAvailability()) {
      alert("You can watch another ad in an hour!");
      return;
    }

    setIsWatchingAd(true);
    setAdProgress(0);
    setCanWatchAd(false);

    // Select a random ad link
    const randomAdLink = AD_LINKS[Math.floor(Math.random() * AD_LINKS.length)];
    
    // Open external ad in new window
    const newWindow = window.open(randomAdLink, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    setAdWindow(newWindow);

    if (!newWindow) {
      alert('Please allow popups to watch ads and earn gems!');
      setIsWatchingAd(false);
      setCanWatchAd(true);
      return;
    }

    // Start progress tracking (20 seconds)
    const adDuration = AD_SETTINGS.duration; // 20 seconds
    const progressInterval = AD_SETTINGS.progressInterval; // Update every 100ms
    const progressStep = (progressInterval / adDuration) * 100;

    const progressTimer = setInterval(() => {
      setAdProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          completeAd();
          return 100;
        }
        return prev + progressStep;
      });
    }, progressInterval);

    // Set a timeout to complete the ad
    setTimeout(() => {
      clearInterval(progressTimer);
      completeAd();
    }, adDuration);

    // Check if window is closed
    const checkWindowClosed = setInterval(() => {
      if (newWindow.closed) {
        clearInterval(checkWindowClosed);
        clearInterval(progressTimer);
        setIsWatchingAd(false);
        setAdProgress(0);
        setCanWatchAd(true);
        alert('Ad window was closed. Please watch the full ad to earn gems.');
      }
    }, 1000);
  };

  const completeAd = async () => {
    try {
      // Close the ad window if it's still open
      if (adWindow && !adWindow.closed) {
        adWindow.close();
      }

      // Call API to award gems
      const response = await fetch('/api/user/watch-ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const gemsEarned = data.gemsEarned || 5;
        
        // Update local state
        setLastWatchTime(Date.now());
        onGemsEarned?.(userGems + gemsEarned);
        
        // Show success message
        alert(`🎉 Congratulations! You earned ${gemsEarned} gems!`);
      } else {
        throw new Error('Failed to award gems');
      }
    } catch (error) {
      console.error('Error awarding gems:', error);
      alert('Failed to award gems. Please try again.');
    } finally {
      setIsWatchingAd(false);
      setAdProgress(0);
      setAdWindow(null);
      
      // Re-enable ad watching after 1 hour
      setTimeout(() => {
        setCanWatchAd(true);
      }, AD_SETTINGS.cooldown);
    }
  };

  const getTimeUntilNextAd = () => {
    if (!lastWatchTime) return null;
    const timeSinceLastWatch = Date.now() - lastWatchTime;
    const remainingTime = AD_SETTINGS.cooldown - timeSinceLastWatch;
    
    if (remainingTime <= 0) return null;
    
    const hours = Math.floor(remainingTime / (60 * 60 * 1000));
    const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const timeUntilNextAd = getTimeUntilNextAd();

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-purple-800 dark:text-purple-200">
          <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 flex-shrink-0" />
          <span className="truncate">Earn Free Gems</span>
          <Badge className="bg-purple-600 text-white ml-2 flex-shrink-0 text-xs">NEW</Badge>
        </CardTitle>
        <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-300">
          Watch a short ad to earn free gems instantly!
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Current Gems Display */}
        <div className="flex items-center justify-between p-2 sm:p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2 min-w-0">
            <Gem className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />
            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base truncate">Your Gems:</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-yellow-600 dark:text-yellow-400 ml-2">
            {userGems}
          </span>
        </div>

        {/* Ad Watching Section */}
        {isWatchingAd ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 animate-pulse flex-shrink-0" />
                <span className="font-semibold text-blue-600 text-sm sm:text-base">Watching Ad...</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 sm:h-3 rounded-full transition-all duration-100"
                  style={{ width: `${adProgress}%` }}
                ></div>
              </div>
              
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {Math.round(adProgress)}% Complete
              </p>
            </div>
            
            <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                Please watch the entire ad to earn your gems!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Reward Info */}
            <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                <Gem className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <span className="font-semibold text-green-700 dark:text-green-300 text-sm sm:text-base truncate">Reward:</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400 ml-2">
                +{AD_SETTINGS.gemsReward} Gems
              </span>
            </div>

            {/* Ad Duration */}
            <div className="flex items-center justify-between p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                <span className="font-semibold text-orange-700 dark:text-orange-300 text-sm sm:text-base truncate">Duration:</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400 ml-2">
                20 seconds
              </span>
            </div>

            {/* Watch Button */}
            {canWatchAd && !timeUntilNextAd ? (
              <Button 
                onClick={startWatchingAd}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 sm:py-3 text-sm sm:text-base"
                disabled={isWatchingAd}
              >
                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span className="truncate">
                  Watch Ad & Earn {AD_SETTINGS.gemsReward} Gems
                </span>
              </Button>
            ) : (
              <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Next ad available in:
                </p>
                <p className="text-sm sm:text-lg font-bold text-gray-700 dark:text-gray-300">
                  {timeUntilNextAd || 'Ready!'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Terms */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
          • One ad per hour • Must watch entire ad • Gems awarded instantly
        </div>
      </CardContent>
    </Card>
  );
} 