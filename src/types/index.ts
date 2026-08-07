export type TabName = 'Home' | 'Task' | 'Leaderboard' | 'Records' | 'Profile' | 'Withdraw' | 'Admin' | 'Onboarding' | 'Invite';

export interface User {
  id: string;
  telegram_id?: number;
  username?: string;
  first_name: string;
  last_name?: string;
  display_name?: string;
  photo_url?: string;
  avatar?: string;
  referral_code?: string;
  registered_at: string;
  referrer_id?: string | null;
  status: 'Active' | 'Banned';
  level_id: string;
  is_premium: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  login_streak: number;
  total_ads_watched: number;
  total_tasks_completed: number;
}

export interface Wallet {
  id: string;
  user_id: string;
  wallet_type: 'Main' | 'Affiliate';
  balance_sb: number;
  balance_usdt: number;
  lifetime_sb: number;
  lifetime_usdt: number;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: 'WatchReward' | 'TaskReward' | 'ReferralReward' | 'DailyReward' | 'LevelUpgrade' | 'Withdrawal' | 'AdViewImpressions';
  currency: 'SB' | 'USDT';
  amount: number;
  status: 'Success' | 'Pending' | 'Failed' | 'Reversed';
  description: string;
  timestamp: string;
}

export interface Level {
  id: string;
  name: string;
  cost: number;
  earning_multiplier: number;
  max_daily_ads_cat_a: number;
  max_daily_ads_cat_b: number;
  max_daily_ads_cat_c: number;
  max_daily_tasks: number;
  min_withdrawal_sb: number;
  min_withdrawal_usdt: number;
  req_account_age: number;
  req_streak: number;
  req_ads: number;
  req_tasks: number;
  req_referrals: number;
  benefits: any;
}

export interface TaskCategory {
  id: string;
  name: string;
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  category_id: string;
  reward_type: 'SB' | 'USDT';
  reward_amount: number;
  description: string;
  link: string;
  status: string;
  badge: 'External Link' | 'Sponsored' | 'Standard';
  button_text: string;
  icon: string;
  requires_screenshot?: boolean;
}

export interface RewardedAd {
  id: string;
  name: string;
  type: string;
  category: string;
  reward_type: 'SB' | 'USDT';
  reward_amount: number;
  watch_time_sec: number;
  remaining_views: number;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  wallet_type: 'Main' | 'Affiliate';
  currency: 'SB' | 'USDT';
  bank_id?: string;
  account_number?: string;
  account_name?: string;
  trc20_address?: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid' | 'Failed';
  created_at: string;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
}

export interface UserBankDetail {
  id: string;
  user_id: string;
  bank_id: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'System' | 'Wallet' | 'Task' | 'Referral';
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_status?: 'Active' | 'Pending' | 'Qualified' | 'Inactive';
  created_at: string;
}

export interface FraudLog {
  id: string;
  user_id: string;
  reason: string;
  details: string;
  severity: string;
  timestamp: string;
}

export interface PostbackLog {
  id: string;
  url: string;
  status_code: number;
  payload: any;
  verified: boolean;
  timestamp: string;
}

export interface ReferralMilestone {
  id: string;
  required_referrals: number;
  reward_type: 'SB' | 'USDT';
  reward_amount: number;
  title: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
}

export interface SdkLog {
  id: string;
  ad_id: string;
  action: string;
  payload: any;
  timestamp: string;
}
