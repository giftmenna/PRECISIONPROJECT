"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, Headphones } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import ThemeToggle from "./ThemeToggle";
import Avatar from "./Avatar";
import NotificationBell from "./NotificationBell";
import UserFeaturesDropdown from "./UserFeaturesDropdown";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    closeMobileMenu();
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/1.jpg"
            alt="Precision Academic World"
            width={250}
            height={75}
            className="h-16 w-auto rounded-md"
          />
        </Link>

        <div className="flex items-center space-x-4">
          <UserFeaturesDropdown />

          {session && (
            <Link href="/ai-assistant">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                <span className="hidden lg:inline">AI Assistant</span>
              </Button>
            </Link>
          )}

          <div className="flex items-center space-x-2">
            {status === "loading" ? (
              <div className="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            ) : session ? (
              <>
                <NotificationBell />
                <Avatar
                  src={session.user?.image || null}
                  name={session.user?.name || null}
                  size="sm"
                  className="border-2 border-gray-200 dark:border-gray-600"
                />
                {(session.user as any)?.role === "admin" || (session.user as any)?.role === "ADMIN" ? (
                  <Link href="/admin/dashboard">
                    <Button variant="outline" size="sm" className="btn-mobile">
                      Admin Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="btn-mobile">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="btn-mobile"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="btn-mobile">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="btn-mobile">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/1.jpg"
              alt="Precision Academic World"
              width={160}
              height={48}
              className="h-16 w-auto rounded-md"
            />
          </Link>

          <div className="flex items-center space-x-2">
            {session && (
              <>
                <Link href="/ai-assistant">
                  <Button variant="outline" size="sm" className="p-2">
                    <Headphones className="h-4 w-4" />
                  </Button>
                </Link>
                <Avatar
                  src={session.user?.image || null}
                  name={session.user?.name || null}
                  size="sm"
                  className="border-2 border-gray-200 dark:border-gray-600"
                />
              </>
            )}
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMobileMenu}
              className="btn-mobile p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {session && (
              <div className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-gray-700 mb-3">
                <Avatar
                  src={session.user?.image || null}
                  name={session.user?.name || null}
                  size="sm"
                  className="border-2 border-gray-200 dark:border-gray-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {session.user?.name || "User"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {session.user?.email}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {session && ((session.user as any)?.role === "admin" || (session.user as any)?.role === "ADMIN") && (
                <Link
                  href="/admin/dashboard"
                  className="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Admin Dashboard
                </Link>
              )}

              {/* User Features Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                
                <UserFeaturesDropdown onClose={closeMobileMenu} isMobile={true} />
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                {status === "loading" ? (
                  <div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                ) : session ? (
                  <div className="space-y-2">
                    <Link href="/dashboard" onClick={closeMobileMenu}>
                      <Button variant="outline" size="sm" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="w-full"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/auth/login" onClick={closeMobileMenu}>
                      <Button variant="outline" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={closeMobileMenu}>
                      <Button size="sm" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
} 