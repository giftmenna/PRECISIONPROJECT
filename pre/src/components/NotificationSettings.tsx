"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Settings, CheckCircle, XCircle } from "lucide-react";
import { PushNotificationClient } from "@/lib/push-client";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettingsData {
  pushEnabled: boolean;
  emailEnabled: boolean;
  newQuestionsEnabled: boolean;
  competitionEnabled: boolean;
  practiceEnabled: boolean;
  reminderEnabled: boolean;
  welcomeMessagesEnabled: boolean;
}

export default function NotificationSettings() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettingsData>({
    pushEnabled: true,
    emailEnabled: true,
    newQuestionsEnabled: true,
    competitionEnabled: true,
    practiceEnabled: true,
    reminderEnabled: true,
    welcomeMessagesEnabled: true
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (session?.user) {
      initializeNotifications();
      fetchSettings();
    }
  }, [session]);

  const initializeNotifications = async () => {
    try {
      const success = await PushNotificationClient.initialize();
      if (success) {
        const subscribed = await PushNotificationClient.isSubscribed();
        setIsSubscribed(subscribed);
      }
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/notifications/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const handlePushToggle = async () => {
    if (!initialized) {
      toast({
        title: "Initializing...",
        description: "Please wait while we set up push notifications.",
      });
      return;
    }

    setLoading(true);
    try {
      if (isSubscribed) {
        // Unsubscribe
        const success = await PushNotificationClient.unsubscribe();
        if (success) {
          setIsSubscribed(false);
          toast({
            title: "Push notifications disabled",
            description: "You will no longer receive push notifications.",
          });
        }
      } else {
        // Subscribe
        const success = await PushNotificationClient.subscribe();
        if (success) {
          setIsSubscribed(true);
          toast({
            title: "Push notifications enabled",
            description: "You will now receive push notifications for new content.",
          });
        } else {
          toast({
            title: "Permission denied",
            description: "Please allow notifications in your browser settings.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update push notification settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof NotificationSettingsData, value: boolean) => {
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [key]: value
        })
      });

      if (response.ok) {
        setSettings(prev => ({ ...prev, [key]: value }));
        toast({
          title: "Settings updated",
          description: "Your notification preferences have been saved.",
        });
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    }
  };

  const testNotification = () => {
    PushNotificationClient.showLocalNotification(
      "Test Notification",
      "This is a test notification from Precision Academic World!",
      "/icons/icon-192x192.png"
    );
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Push Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Push Notifications</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications on your device when new content is available
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isSubscribed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <Button
                  variant={isSubscribed ? "outline" : "default"}
                  onClick={handlePushToggle}
                  disabled={loading || !initialized}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    "Loading..."
                  ) : isSubscribed ? (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Enable
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {initialized && (
              <Button
                variant="outline"
                size="sm"
                onClick={testNotification}
                className="w-full"
              >
                Test Push Notification
              </Button>
            )}
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>New Questions</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when new practice questions are added
                  </p>
                </div>
                <Switch
                  checked={settings.newQuestionsEnabled}
                  onCheckedChange={(checked: boolean) => updateSetting('newQuestionsEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Competitions</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notifications about upcoming and active competitions
                  </p>
                </div>
                <Switch
                  checked={settings.competitionEnabled}
                  onCheckedChange={(checked: boolean) => updateSetting('competitionEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Practice Reminders</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gentle reminders to practice regularly
                  </p>
                </div>
                <Switch
                  checked={settings.practiceEnabled}
                  onCheckedChange={(checked: boolean) => updateSetting('practiceEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Welcome Messages</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Welcome notifications when you log in
                  </p>
                </div>
                <Switch
                  checked={settings.welcomeMessagesEnabled}
                  onCheckedChange={(checked: boolean) => updateSetting('welcomeMessagesEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked: boolean) => updateSetting('emailEnabled', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 