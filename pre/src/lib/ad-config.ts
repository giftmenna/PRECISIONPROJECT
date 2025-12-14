// Ad Configuration
// Replace these URLs with your actual external ad links

// RECOMMENDED AD PLATFORMS FOR MONETIZATION:
// 1. Google AdSense - Best for content-based ads, requires 1000+ monthly visitors
//    - Sign up: https://www.google.com/adsense
//    - Revenue: $0.10-$2.00 per click, $1-$10 per 1000 impressions
//    - Requirements: Original content, no copyright violations, 6+ months old domain
//
// 2. Media.net (Yahoo/Bing Ads) - Alternative to AdSense
//    - Sign up: https://www.media.net/
//    - Revenue: Similar to AdSense, good for rejected AdSense sites
//    - Requirements: 50,000+ monthly pageviews
//
// 3. AdMob (Mobile apps) - For mobile app monetization
//    - Sign up: https://admob.google.com/
//    - Revenue: $0.50-$5.00 per 1000 impressions
//    - Requirements: Mobile app with 1000+ daily active users
//
// 4. Amazon Associates - Product recommendation ads
//    - Sign up: https://affiliate-program.amazon.com/
//    - Revenue: 1-10% commission on sales
//    - Requirements: 3 sales in first 180 days
//
// 5. ShareASale - Affiliate marketing network
//    - Sign up: https://www.shareasale.com/
//    - Revenue: 5-20% commission on sales
//    - Requirements: Active website with traffic
//
// 6. AdRoll - Retargeting and display ads
//    - Sign up: https://www.adroll.com/
//    - Revenue: $2-$10 per 1000 impressions
//    - Requirements: 1000+ monthly visitors
//
// 7. Taboola/Outbrain - Content recommendation ads
//    - Sign up: https://www.taboola.com/ or https://www.outbrain.com/
//    - Revenue: $0.50-$3.00 per 1000 impressions
//    - Requirements: 50,000+ monthly pageviews
//
// 8. Carbon Ads - Developer-focused ads
//    - Sign up: https://carbonads.com/
//    - Revenue: $2-$8 per 1000 impressions
//    - Requirements: Developer/tech audience
//
// 9. BuySellAds - Direct ad sales
//    - Sign up: https://www.buysellads.com/
//    - Revenue: $1-$10 per 1000 impressions
//    - Requirements: 10,000+ monthly visitors
//
// 10. PropellerAds - Pop-under and push notifications
//     - Sign up: https://propellerads.com/
//     - Revenue: $0.50-$3.00 per 1000 impressions
//     - Requirements: 1000+ daily visitors

export const AD_LINKS = [
  // Example ad URLs - replace with your real ad network URLs
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://www.youtube.com/watch?v=9bZkp7q19f0", 
  "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
  
  // Add your actual ad network URLs here:
  // "https://your-ad-network.com/ad1",
  // "https://your-ad-network.com/ad2",
  // "https://your-ad-network.com/ad3",
];

// Ad settings
export const AD_SETTINGS = {
  duration: 20000, // 20 seconds in milliseconds
  cooldown: 60 * 60 * 1000, // 1 hour in milliseconds
  gemsReward: 0.00001, // Can be set as low as 0.00001 gems per ad
  windowWidth: 800,
  windowHeight: 600,
  progressInterval: 100, // Update progress every 100ms
};

// Ad network configuration
export const AD_NETWORK_CONFIG = {
  // You can add specific ad network settings here
  // For example, if using Google AdSense, AdMob, etc.
  network: "external", // "external", "adsense", "admob", etc.
  enableTracking: true,
  requireUserInteraction: true,
  
  // Recommended settings for different platforms:
  // Google AdSense: { network: "adsense", enableTracking: true, requireUserInteraction: true }
  // AdMob: { network: "admob", enableTracking: true, requireUserInteraction: true }
  // Media.net: { network: "medianet", enableTracking: true, requireUserInteraction: true }
}; 