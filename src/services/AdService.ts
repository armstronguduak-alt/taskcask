import { updateDB, loadDB, addTransaction } from '../db/mockDb';
import type { RewardedAd } from '../db/mockDb';

export interface AdFormatResult {
  success: boolean;
  rewardClaimed: boolean;
  message: string;
  txId?: string;
}

export const AdService = {
  // Check if SDK is available
  checkSdkAvailability: (): boolean => {
    // In our client build, the SDK script is included in the window
    return typeof (window as any).Telegram !== 'undefined';
  },

  // Log SDK action
  logSdkAction: (adId: string, action: string, payload: any) => {
    updateDB((db) => {
      db.sdk_logs.unshift({
        id: 'sdk_' + Math.random().toString(36).substr(2, 9),
        ad_id: adId,
        action,
        payload: JSON.stringify(payload),
        timestamp: new Date().toISOString()
      });
    });
  },

  // Log Postback
  logPostback: (url: string, payload: any, verified: boolean) => {
    updateDB((db) => {
      db.postback_logs.unshift({
        id: 'post_' + Math.random().toString(36).substr(2, 9),
        url,
        status_code: 200,
        payload: JSON.stringify(payload),
        verified,
        timestamp: new Date().toISOString()
      });
    });
  },

  // Log Fraud
  logFraud: (userId: string, reason: string, details: string, severity: 'Low' | 'Medium' | 'High') => {
    updateDB((db) => {
      db.fraud_logs.unshift({
        id: 'frd_' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        reason,
        details,
        severity,
        timestamp: new Date().toISOString()
      });
    });
  },

  // Validation & Crediting Flow
  validateAndCreditReward: async (
    userId: string,
    ad: RewardedAd
  ): Promise<AdFormatResult> => {
    const db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, rewardClaimed: false, message: 'User not found' };
    }

    if (user.status === 'Banned') {
      AdService.logFraud(userId, 'Banned User Ad Watch', 'User attempted to watch ads while account status is Banned.', 'High');
      return { success: false, rewardClaimed: false, message: 'Account suspended.' };
    }

    const userLevel = db.levels.find(l => l.id === user.level_id) || db.levels[0];

    // Anti-Fraud Checks
    // 1. Cooldown Check (e.g. at most 1 ad every 10 seconds)
    const recentViews = db.ad_views.filter(v => v.user_id === userId);
    if (recentViews.length > 0) {
      const lastViewTime = new Date(recentViews[0].timestamp).getTime();
      const timeDiff = (Date.now() - lastViewTime) / 1000;
      if (timeDiff < 8) {
        AdService.logFraud(userId, 'Ad Cooldown Violation', `Ad watched within ${timeDiff.toFixed(1)}s (cooldown is 8s)`, 'Medium');
        return { success: false, rewardClaimed: false, message: 'Earning too fast! Cooldown is active.' };
      }
    }

    // 2. Daily Limit Check
    const today = new Date().toDateString();
    const todayViews = db.ad_views.filter(
      v => v.user_id === userId && new Date(v.timestamp).toDateString() === today && v.rewarded
    );
    if (todayViews.length >= userLevel.max_daily_ads) {
      return { success: false, rewardClaimed: false, message: `Daily ad limit reached (${userLevel.max_daily_ads}/${userLevel.max_daily_ads} ads)` };
    }

    // Simulate Server-Side Postback verification
    const postbackUrl = `https://api.taskcash.xyz/postbacks/ad-rewards?user_id=${userId}&ad_id=${ad.id}`;
    const securePayload = {
      user_id: userId,
      ad_id: ad.id,
      reward_amount: ad.reward_amount,
      multiplier: userLevel.earning_multiplier,
      signature: 'sha256_mock_hash_verification_passed_' + Math.random().toString(16).substring(2, 10)
    };

    AdService.logPostback(postbackUrl, securePayload, true);

    // Apply multiplier
    const rawReward = ad.reward_amount;
    const multipliedReward = Math.round(rawReward * userLevel.earning_multiplier);

    // Write Ad View Log
    updateDB((db) => {
      db.ad_views.unshift({
        id: 'view_' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        ad_id: ad.id,
        timestamp: new Date().toISOString(),
        rewarded: true
      });
    });

    // Credit User Wallet with Transaction
    const { tx } = addTransaction(
      userId,
      'WatchReward',
      multipliedReward,
      `Watched Ad: ${ad.name} (${userLevel.name} ${userLevel.earning_multiplier}x multiplier)`
    );

    // Push notification
    updateDB((db) => {
      db.notifications.unshift({
        id: 'nt_' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        title: 'Ad Reward Credited',
        message: `You earned ₦${multipliedReward.toFixed(2)} from watching an ad!`,
        read: false,
        type: 'Wallet',
        created_at: new Date().toISOString()
      });
    });

    return {
      success: true,
      rewardClaimed: true,
      message: `Successfully earned ₦${multipliedReward.toFixed(2)}!`,
      txId: tx.id
    };
  }
};
