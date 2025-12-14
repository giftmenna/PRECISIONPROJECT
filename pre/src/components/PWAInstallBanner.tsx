"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share } from 'lucide-react';

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed/standalone
    const checkStandalone = () => {
      return (
        (window.navigator as any).standalone ||
        window.matchMedia('(display-mode: standalone)').matches
      );
    };

    // Check if dismissed before
    const isDismissed = localStorage.getItem('pwaInstallDismissed') === 'true';

    // Detect iOS
    const detectIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    };

    // Check if mobile
    const isMobile = window.innerWidth <= 768;

    const standalone = checkStandalone();
    const ios = detectIOS();

    setIsStandalone(standalone);
    setIsIOS(ios);

    // Don't show if already installed, dismissed, or not mobile
    if (standalone || isDismissed || !isMobile) {
      return;
    }

    if (ios) {
      // For iOS: Show instructional message
      setShowBanner(true);
    } else {
      // For Android/Chrome: Listen for beforeinstallprompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowBanner(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Handle if installed via browser UI
      const handleAppInstalled = () => {
        setShowBanner(false);
      };

      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        const { outcome } = await deferredPrompt.prompt();
        if (outcome === 'accepted') {
          console.log('User installed the app');
          setShowBanner(false);
        }
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Installation failed:', error);
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwaInstallDismissed', 'true');
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-white p-4 z-50 border-t border-gray-700">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-3 flex-1">
          {isIOS ? (
            <>
              <Share className="h-5 w-5 text-blue-400" />
              <div className="text-sm">
                <p className="font-medium">Add to Home Screen</p>
                <p className="text-gray-300 text-xs">
                  Tap the Share icon below and select "Add to Home Screen"
                </p>
              </div>
            </>
          ) : (
            <>
              <Download className="h-5 w-5 text-blue-400" />
              <div className="text-sm">
                <p className="font-medium">Install App</p>
                <p className="text-gray-300 text-xs">
                  Add this app to your home screen for easy access!
                </p>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {!isIOS && (
            <Button
              onClick={handleInstall}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
            >
              Install
            </Button>
          )}
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 