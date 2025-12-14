import { prisma } from "@/lib/prisma";

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export class PushNotificationService {
  private static readonly VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
  private static readonly VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

  /**
   * Subscribe a user to push notifications
   */
  static async subscribeUser(userId: string, subscription: PushSubscriptionData) {
    try {
      await prisma.pushSubscription.upsert({
        where: {
          userId_endpoint: {
            userId,
            endpoint: subscription.endpoint
          }
        },
        update: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
          updatedAt: new Date()
        },
        create: {
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error subscribing user to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe a user from push notifications
   */
  static async unsubscribeUser(userId: string, endpoint: string) {
    try {
      await prisma.pushSubscription.delete({
        where: {
          userId_endpoint: {
            userId,
            endpoint
          }
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error unsubscribing user from push notifications:', error);
      throw error;
    }
  }

  /**
   * Send push notification to a specific user
   */
  static async sendToUser(userId: string, payload: PushNotificationPayload) {
    try {
      // Check if user has push notifications enabled
      const settings = await prisma.notificationSettings.findUnique({
        where: { userId }
      });

      if (!settings?.pushEnabled) {
        return { success: false, reason: 'Push notifications disabled' };
      }

      // Get user's push subscriptions
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
      });

      if (subscriptions.length === 0) {
        return { success: false, reason: 'No push subscriptions found' };
      }

      // Send to all user's devices
      const results = await Promise.allSettled(
        subscriptions.map(sub => this.sendToSubscription(sub, payload))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return {
        success: true,
        sent: successful,
        failed,
        total: subscriptions.length
      };
    } catch (error) {
      console.error('Error sending push notification to user:', error);
      throw error;
    }
  }

  /**
   * Send push notification to all subscribed users
   */
  static async sendToAllUsers(payload: PushNotificationPayload) {
    try {
      // Get all users with push notifications enabled
      const users = await prisma.user.findMany({
        where: {
          notificationSettings: {
            pushEnabled: true
          }
        },
        include: {
          pushSubscriptions: true
        }
      });

      const results = [];
      for (const user of users) {
        if (user.pushSubscriptions.length > 0) {
          const result = await this.sendToUser(user.id, payload);
          results.push({ userId: user.id, ...result });
        }
      }

      return {
        success: true,
        totalUsers: users.length,
        results
      };
    } catch (error) {
      console.error('Error sending push notifications to all users:', error);
      throw error;
    }
  }

  /**
   * Send push notification to specific subscription
   */
  private static async sendToSubscription(
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: PushNotificationPayload
  ) {
    try {
      const response = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'TTL': '86400', // 24 hours
          'Urgency': 'normal'
        },
        body: JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/icons/icon-192x192.png',
          badge: payload.badge || '/icons/icon-192x192.png',
          data: payload.data || {},
          actions: payload.actions || []
        })
      });

      if (!response.ok) {
        throw new Error(`Push notification failed: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending to subscription:', error);
      throw error;
    }
  }

  /**
   * Send welcome notification for first-time users
   */
  static async sendWelcomeNotification(userId: string, userName?: string) {
    const payload: PushNotificationPayload = {
      title: 'Welcome to Precision Academic World! 🎓',
      body: `Hello ${userName || 'there'}! Ready to master mathematics? Start your journey with our comprehensive practice questions.`,
      icon: '/icons/icon-192x192.png',
      data: {
        type: 'WELCOME_FIRST_TIME',
        url: '/practice'
      },
      actions: [
        {
          action: 'start_practice',
          title: 'Start Practice',
          icon: '/icons/practice.png'
        }
      ]
    };

    return this.sendToUser(userId, payload);
  }

  /**
   * Send welcome back notification for returning users
   */
  static async sendWelcomeBackNotification(userId: string, userName?: string) {
    const payload: PushNotificationPayload = {
      title: 'Welcome Back! 📚',
      body: `Great to see you again, ${userName || 'there'}! Check out the latest questions and competitions.`,
      icon: '/icons/icon-192x192.png',
      data: {
        type: 'WELCOME_BACK',
        url: '/dashboard'
      },
      actions: [
        {
          action: 'view_dashboard',
          title: 'View Dashboard',
          icon: '/icons/dashboard.png'
        }
      ]
    };

    return this.sendToUser(userId, payload);
  }

  /**
   * Send new questions notification
   */
  static async sendNewQuestionsNotification(
    questionCount: number,
    topic?: string,
    sendToAll: boolean = false
  ) {
    const payload: PushNotificationPayload = {
      title: 'New Questions Available! 🎯',
      body: topic 
        ? `${questionCount} new ${topic} questions have been added!`
        : `${questionCount} new practice questions are ready for you!`,
      icon: '/icons/icon-192x192.png',
      data: {
        type: 'NEW_QUESTIONS_POSTED',
        questionCount,
        topic,
        url: '/practice'
      },
      actions: [
        {
          action: 'practice_now',
          title: 'Practice Now',
          icon: '/icons/practice.png'
        }
      ]
    };

    if (sendToAll) {
      return this.sendToAllUsers(payload);
    } else {
      // Send to users who have new questions enabled
      const users = await prisma.user.findMany({
        where: {
          notificationSettings: {
            newQuestionsEnabled: true,
            pushEnabled: true
          }
        }
      });

      const results = [];
      for (const user of users) {
        const result = await this.sendToUser(user.id, payload);
        results.push({ userId: user.id, ...result });
      }

      return {
        success: true,
        totalUsers: users.length,
        results
      };
    }
  }

  /**
   * Get VAPID public key for client-side subscription
   */
  static getVapidPublicKey(): string {
    if (!this.VAPID_PUBLIC_KEY) {
      throw new Error('VAPID_PUBLIC_KEY not configured');
    }
    return this.VAPID_PUBLIC_KEY;
  }
} 