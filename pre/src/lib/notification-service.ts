export interface NotificationData {
  type: 'NEW_QUESTION' | 'COMPETITION_STARTING' | 'PRACTICE_REMINDER' | 'COMPETITION_RESULT' | 'GEM_EARNED' | 'SYSTEM_UPDATE' | 'WELCOME_FIRST_TIME' | 'WELCOME_BACK' | 'NEW_QUESTIONS_POSTED';
  title: string;
  message: string;
  data?: any;
  scheduledAt?: Date;
}

export class NotificationService {
  /**
   * Send notification to all users or specific users
   */
  static async sendNotification(
    notification: NotificationData,
    userIds?: string[]
  ) {
    try {
      // For now, we'll use browser notifications
      // In a real app, this would send to all users in the database
      console.log('Sending notification:', notification);
      
      // Store notification in localStorage for the current user
      if (typeof window !== 'undefined') {
        const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const newNotification = {
          id: Date.now().toString(),
          ...notification,
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: 'current-user' // In real app, this would be the actual user ID
        };
        
        existingNotifications.unshift(newNotification);
        localStorage.setItem('notifications', JSON.stringify(existingNotifications.slice(0, 50))); // Keep only last 50
        
        // Show browser notification if permission is granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/1.jpg',
            badge: '/1.jpg'
          });
        }
      }
      
      return [notification];
    } catch (error) {
      console.error("Error sending notifications:", error);
      throw error;
    }
  }

  /**
   * Check if user should receive welcome message and send if needed
   */
  static async checkAndSendWelcomeMessage(userId: string, userName?: string) {
    try {
      const { prisma } = await import('@/lib/prisma');
      
      // Get user's notification settings
      const settings = await prisma.notificationSettings.findUnique({
        where: { userId }
      });

      if (!settings?.welcomeMessagesEnabled) {
        return { sent: false, reason: 'Welcome messages disabled' };
      }

      // Get user's last login time
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { lastLoginAt: true, createdAt: true }
      });

      if (!user) {
        return { sent: false, reason: 'User not found' };
      }

      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

      // Check if this is the first login (no lastLoginAt set)
      if (!user.lastLoginAt) {
        // First-time user - send welcome notification
        await this.sendWelcomeNotification(userId, userName);
        return { sent: true, type: 'first_time' };
      }

      // Check if user has been logged out for more than 30 minutes
      if (user.lastLoginAt < thirtyMinutesAgo) {
        // Returning user after long absence - send welcome back notification
        await this.sendWelcomeBackNotification(userId, userName);
        return { sent: true, type: 'welcome_back' };
      }

      return { sent: false, reason: 'Recent login' };
    } catch (error) {
      console.error('Error checking welcome message:', error);
      return { sent: false, reason: 'Error occurred' };
    }
  }

  /**
   * Send welcome notification for first-time users
   */
  static async sendWelcomeNotification(userId: string, userName?: string) {
    const notification: NotificationData = {
      type: 'WELCOME_FIRST_TIME',
      title: 'Welcome to Precision Academic World! 🎓',
      message: `Hello ${userName || 'there'}! Ready to master mathematics? Start your journey with our comprehensive practice questions.`,
      data: {
        type: 'WELCOME_FIRST_TIME',
        url: '/practice'
      }
    };

    return this.sendNotification(notification, [userId]);
  }

  /**
   * Send welcome back notification for returning users
   */
  static async sendWelcomeBackNotification(userId: string, userName?: string) {
    const notification: NotificationData = {
      type: 'WELCOME_BACK',
      title: 'Welcome Back! 📚',
      message: `Great to see you again, ${userName || 'there'}! Check out the latest questions and competitions.`,
      data: {
        type: 'WELCOME_BACK',
        url: '/dashboard'
      }
    };

    return this.sendNotification(notification, [userId]);
  }

  /**
   * Send notification for new questions with timing logic
   */
  static async sendNewQuestionNotification(
    questionData: {
      id: string;
      topic: string;
      questionType?: string;  // Made optional
      scheduledAt?: Date;
    }
  ) {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    // If question is scheduled for future and more than 30 minutes away, don't send notification
    if (questionData.scheduledAt && questionData.scheduledAt > thirtyMinutesFromNow) {
      console.log("Question scheduled for future, notification will be sent later");
      return;
    }

    const notification: NotificationData = {
      type: "NEW_QUESTION",
      title: "New Question Available! 🎯",
      message: `A new ${questionData.questionType} question in ${questionData.topic} is now available for practice!`,
      data: {
        questionId: questionData.id,
        topic: questionData.topic,
        questionType: questionData.questionType
      },
      scheduledAt: questionData.scheduledAt
    };

    return await this.sendNotification(notification);
  }

  /**
   * Send notification for competition starting soon
   */
  static async sendCompetitionNotification(
    competitionData: {
      id: string;
      name: string;
      startsAt: Date;
      entryPriceGem?: number;
    }
  ) {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    // Only send notification if competition starts within 30 minutes
    if (competitionData.startsAt > thirtyMinutesFromNow) {
      console.log("Competition starts later, notification will be sent closer to start time");
      return;
    }

    const timeUntilStart = Math.max(0, competitionData.startsAt.getTime() - now.getTime());
    const minutesUntilStart = Math.ceil(timeUntilStart / (1000 * 60));

    let message = `Competition "${competitionData.name}" starts in ${minutesUntilStart} minutes!`;
    if (competitionData.entryPriceGem) {
      message += ` Entry fee: ${competitionData.entryPriceGem} gems`;
    }

    const notification: NotificationData = {
      type: "COMPETITION_STARTING",
      title: "Competition Starting Soon! 🏆",
      message,
      data: {
        competitionId: competitionData.id,
        name: competitionData.name,
        startsAt: competitionData.startsAt,
        entryPriceGem: competitionData.entryPriceGem
      }
    };

    return await this.sendNotification(notification);
  }

  /**
   * Send real-time notification (for WebSocket or push notifications)
   */
  static async sendRealTimeNotification(userId: string, notification: NotificationData) {
    // This would integrate with WebSocket, Push API, or other real-time systems
    // For now, we'll just log it
    console.log(`Real-time notification sent to user ${userId}:`, notification.title);
    
    // Show browser notification if permission is granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/1.jpg',
        badge: '/1.jpg'
      });
    }
  }

  /**
   * Get unread notifications for a user
   */
  static async getUserNotifications(userId: string, limit: number = 20) {
    if (typeof window !== 'undefined') {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      return notifications.filter((n: any) => !n.isRead).slice(0, limit);
    }
    return [];
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string) {
    if (typeof window !== 'undefined') {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = notifications.map((n: any) => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    if (typeof window !== 'undefined') {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = notifications.map((n: any) => ({ ...n, isRead: true }));
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    }
  }

  /**
   * Get notification count for a user
   */
  static async getUnreadCount(userId: string) {
    if (typeof window !== 'undefined') {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      return notifications.filter((n: any) => !n.isRead).length;
    }
    return 0;
  }

  /**
   * Request notification permission
   */
  static async requestPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
} 