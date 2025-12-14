"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Home, BookOpen, Trophy, Award, User, Settings, LogOut, Bot, MessageCircle, Calendar, UserPlus } from "lucide-react";

interface UserFeaturesDropdownProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export default function UserFeaturesDropdown({ onClose, isMobile = false }: UserFeaturesDropdownProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [learnSubmenuOpen, setLearnSubmenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setLearnSubmenuOpen(false);
    if (onClose) onClose();
  };

  const toggleLearnSubmenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setLearnSubmenuOpen(!learnSubmenuOpen);
  };

  const userFeatures = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      description: "Go to homepage"
    },
    {
      name: "Learn",
      href: "#",
      icon: BookOpen,
      description: "Learning activities",
      hasSubmenu: true
    },
    {
      name: 'Community Discussion',
      href: '/group-chat',
      icon: MessageCircle,
      requiresAuth: true,
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: Award,
      description: "View rankings"
    },
    {
      name: "Profile Settings",
      href: "/profile",
      icon: User,
      description: "Manage your profile",
      requiresAuth: true
    },
    {
      name: "Referrals",
      href: "/referrals",
      icon: UserPlus,
      description: "Earn gems by inviting friends",
      requiresAuth: true
    }
  ];

  const learnSubmenu = [
    {
      name: "Competitions",
      href: "/competition",
      icon: Trophy,
      description: "Join competitions",
      requiresAuth: true
    },
    {
      name: "Learning Modules",
      href: "/learn",
      icon: BookOpen,
      description: "Structured learning courses",
      requiresAuth: true
    },
    {
      name: "Practice Mode",
      href: "/practice",
      icon: BookOpen, // Consider using a different icon, e.g., 'Target'
      description: "Practice individual questions",
      requiresAuth: true
    },
    {
      name: "Daily Lessons",
      href: "/daily-lessons",
      icon: Calendar,
      description: "Daily learning challenges",
      requiresAuth: true
    },
  ];

  if (isMobile) {
    return (
      <div className="space-y-2">
        {userFeatures.map((feature) => {
          if (feature.requiresAuth && !session) return null;
          
          const IconComponent = feature.icon;
          
          if (feature.hasSubmenu) {
            return (
              <div key={feature.name} className="space-y-1">
                <button
                  onClick={toggleLearnSubmenu}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">{feature.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <ChevronDown className={`h-4 w-4 text-blue-600 dark:text-blue-400 transition-transform ${learnSubmenuOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {learnSubmenuOpen && (
                  <div className="ml-6 space-y-1">
                    {learnSubmenu.map((subItem) => {
                      if (subItem.requiresAuth && !session) return null;
                      
                      const SubIconComponent = subItem.icon;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="flex items-center gap-3 px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          onClick={handleLinkClick}
                        >
                          <SubIconComponent className="h-4 w-4" />
                          <div>
                            <div className="font-medium text-sm">{subItem.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{subItem.description}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <Link
              key={feature.name}
              href={feature.href}
              className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={handleLinkClick}
            >
              <IconComponent className="h-4 w-4" />
              <div>
                <div className="font-medium">{feature.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={toggleDropdown}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
      >
        <User className="h-4 w-4" />
        User Features
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">User Features</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Access all user functionality</p>
          </div>
          
          <div className="py-1">
            {userFeatures.map((feature) => {
              if (feature.requiresAuth && !session) return null;
              
              const IconComponent = feature.icon;
              
              if (feature.hasSubmenu) {
                return (
                  <div key={feature.name}>
                    <button
                      onClick={toggleLearnSubmenu}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium border-b border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium text-sm">{feature.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <ChevronDown className={`h-4 w-4 text-blue-600 dark:text-blue-400 transition-transform ${learnSubmenuOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    {learnSubmenuOpen && (
                      <div className="py-1">
                        {learnSubmenu.map((subItem) => {
                          if (subItem.requiresAuth && !session) return null;
                          
                          const SubIconComponent = subItem.icon;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="flex items-center gap-3 px-3 py-2 pl-8 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              onClick={handleLinkClick}
                            >
                              <SubIconComponent className="h-4 w-4" />
                              <div>
                                <div className="font-medium text-sm">{subItem.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{subItem.description}</div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={feature.name}
                  href={feature.href}
                  className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={handleLinkClick}
                >
                  <IconComponent className="h-4 w-4" />
                  <div>
                    <div className="font-medium text-sm">{feature.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 