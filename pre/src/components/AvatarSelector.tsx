"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Sparkles, Zap, Star, Heart, Crown, Shield, Target } from "lucide-react";

interface AvatarOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const avatarOptions: AvatarOption[] = [
  {
    id: "sparkles",
    name: "Sparkles",
    icon: <Sparkles className="w-full h-full text-white" />,
    color: "from-pink-500 to-purple-600",
    gradient: "bg-gradient-to-br from-pink-500 to-purple-600"
  },
  {
    id: "zap",
    name: "Lightning",
    icon: <Zap className="w-full h-full text-white" />,
    color: "from-yellow-400 to-orange-500",
    gradient: "bg-gradient-to-br from-yellow-400 to-orange-500"
  },
  {
    id: "star",
    name: "Star",
    icon: <Star className="w-full h-full text-white" />,
    color: "from-blue-500 to-indigo-600",
    gradient: "bg-gradient-to-br from-blue-500 to-indigo-600"
  },
  {
    id: "heart",
    name: "Heart",
    icon: <Heart className="w-full h-full text-white" />,
    color: "from-red-500 to-pink-600",
    gradient: "bg-gradient-to-br from-red-500 to-pink-600"
  },
  {
    id: "crown",
    name: "Crown",
    icon: <Crown className="w-full h-full text-white" />,
    color: "from-yellow-500 to-amber-600",
    gradient: "bg-gradient-to-br from-yellow-500 to-amber-600"
  },
  {
    id: "shield",
    name: "Shield",
    icon: <Shield className="w-full h-full text-white" />,
    color: "from-green-500 to-emerald-600",
    gradient: "bg-gradient-to-br from-green-500 to-emerald-600"
  },
  {
    id: "target",
    name: "Target",
    icon: <Target className="w-full h-full text-white" />,
    color: "from-purple-500 to-violet-600",
    gradient: "bg-gradient-to-br from-purple-500 to-violet-600"
  }
];

interface AvatarSelectorProps {
  onSelect: (avatarId: string) => void;
  selectedAvatar?: string | null;
  loading?: boolean;
}

export default function AvatarSelector({ onSelect, selectedAvatar, loading = false }: AvatarSelectorProps) {
  const { toast } = useToast();
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  const handleAvatarSelect = async (avatarId: string) => {
    try {
      // Create a mock file for the selected avatar
      const response = await fetch(`/api/user/avatar/select`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatarId }),
      });

      if (response.ok) {
        onSelect(avatarId);
        toast({
          title: "Success",
          description: "Avatar selected successfully!",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to select avatar",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to select avatar",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Choose Your Avatar
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select from our collection of beautiful avatars
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {avatarOptions.map((option) => (
            <div
              key={option.id}
              className={`relative group cursor-pointer transition-all duration-200 ${
                selectedAvatar === option.id
                  ? "ring-2 ring-blue-500 ring-offset-2"
                  : "hover:scale-105"
              }`}
              onMouseEnter={() => setHoveredAvatar(option.id)}
              onMouseLeave={() => setHoveredAvatar(null)}
              onClick={() => !loading && handleAvatarSelect(option.id)}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                  option.gradient
                } ${
                  hoveredAvatar === option.id ? "shadow-lg" : "shadow-md"
                }`}
              >
                <div className="w-8 h-8">
                  {option.icon}
                </div>
              </div>
              
              {selectedAvatar === option.id && (
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
              
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {option.name}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Click on any avatar to select it as your profile picture
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 