/**
 * Generate a unique referral code for a user
 * Format: PRAW + 4 random digits (e.g., PRAW2893)
 * @returns A unique referral code
 */
export function generateReferralCode(): string {
  // Generate 4 random digits
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  
  // Format: PRAW + 4 digits
  return `PRAW${randomDigits}`;
}

/**
 * Validate a referral code format
 * @param code - The referral code to validate
 * @returns True if the code format is valid
 */
export function isValidReferralCode(code: string): boolean {
  // Check if code matches PRAW + 4 digits format
  return /^PRAW\d{4}$/.test(code);
}

/**
 * Extract user ID from referral code (if possible)
 * @param code - The referral code
 * @returns The user ID if found, null otherwise
 */
export function extractUserIdFromCode(code: string): string | null {
  // This is a simplified implementation
  // In a real system, you might want to store a mapping or use a more sophisticated algorithm
  if (!isValidReferralCode(code)) {
    return null;
  }
  
  // For now, we'll need to look up the code in the database
  return null;
}

/**
 * Get referral URL for a given code
 * @param code - The referral code
 * @param baseUrl - The base URL of the application
 * @returns The complete referral URL
 */
export function getReferralUrl(code: string, baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'): string {
  return `${baseUrl}/auth/signup?ref=${code}`;
}

/**
 * Check if a user has completed the minimum required activity
 * @param activityType - The type of activity to check
 * @param userActivities - Array of user's completed activities
 * @returns True if the user has completed the required activity
 */
export function hasCompletedRequiredActivity(
  activityType: string, 
  userActivities: Array<{ type: string; completedAt: Date }>
): boolean {
  switch (activityType) {
    case 'practice':
      return userActivities.some(activity => activity.type === 'practice');
    case 'competition':
      return userActivities.some(activity => activity.type === 'competition');
    case 'daily_lesson':
      return userActivities.some(activity => activity.type === 'daily_lesson');
    case 'any':
      return userActivities.length > 0;
    default:
      return false;
  }
} 