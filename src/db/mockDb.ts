// Client-side Mock Database representing all 22 requested tables in LocalStorage

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string;
  registered_at: string;
  referrer_id: string | null;
  status: 'Active' | 'Banned';
  level_id: string; // foreign key
  is_premium?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  login_streak?: number;
  total_ads_watched?: number;
  total_tasks_completed?: number;
}

export interface Wallet {
  id: string;
  user_id: string;
  active_balance: number;
  lifetime_earnings: number;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: 'WatchReward' | 'TaskReward' | 'ReferralReward' | 'DailyReward' | 'LevelUpgrade' | 'Withdrawal' | 'AdViewImpressions';
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
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
  min_withdrawal: number;
  req_account_age: number;
  req_streak: number;
  req_ads: number;
  req_tasks: number;
  req_referrals: number;
  benefits: string[];
}

export interface Task {
  id: string;
  title: string;
  category_id: string;
  reward_amount: number;
  description: string;
  link: string;
  status: 'Active' | 'Inactive';
  badge?: 'External Link' | 'Sponsored' | 'Standard';
  buttonText?: string;
  icon?: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  icon: string;
}

export interface RewardedAd {
  id: string;
  name: string;
  type: 'Interstitial' | 'Popup' | 'InAppInterstitial';
  category: 'A' | 'B' | 'C' | 'None';
  reward_amount: number;
  watch_time_sec: number;
  remaining_views: number;
}

export interface AdView {
  id: string;
  user_id: string;
  ad_id: string;
  timestamp: string;
  rewarded: boolean;
}

export interface DailyReward {
  id: string;
  user_id: string;
  day_number: number;
  amount: number;
  claimed_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  bank_id: string;
  account_number: string;
  account_name: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
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
  created_at: string;
}

export interface ReferralEarning {
  id: string;
  referrer_id: string;
  referral_id: string;
  amount: number;
  created_at: string;
}

export interface ReferralMilestone {
  id: string;
  required_referrals: number;
  reward_amount: number;
  title: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  unlocked_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  ip: string;
  user_agent: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'Admin' | 'Moderator';
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
}

export interface Advertisement {
  id: string;
  title: string;
  type: string;
  link: string;
  budget: number;
  status: 'Active' | 'Paused' | 'Ended';
}

export interface SdkLog {
  id: string;
  ad_id: string;
  action: string;
  payload: string;
  timestamp: string;
}

export interface PostbackLog {
  id: string;
  url: string;
  status_code: number;
  payload: string;
  verified: boolean;
  timestamp: string;
}

export interface FraudLog {
  id: string;
  user_id: string;
  reason: string;
  details: string;
  severity: 'Low' | 'Medium' | 'High';
  timestamp: string;
}

// Relational Mock DB schema mapping
export interface TaskCashDB {
  users: User[];
  wallets: Wallet[];
  transactions: Transaction[];
  levels: Level[];
  tasks: Task[];
  task_categories: TaskCategory[];
  rewarded_ads: RewardedAd[];
  ad_views: AdView[];
  daily_rewards: DailyReward[];
  withdrawal_requests: WithdrawalRequest[];
  banks: Bank[];
  notifications: Notification[];
  referrals: Referral[];
  referral_earnings: ReferralEarning[];
  achievements: Achievement[];
  activity_logs: ActivityLog[];
  admin_users: AdminUser[];
  system_settings: SystemSetting[];
  advertisements: Advertisement[];
  sdk_logs: SdkLog[];
  postback_logs: PostbackLog[];
  fraud_logs: FraudLog[];
  user_bank_details: UserBankDetail[];
  referral_milestones: ReferralMilestone[];
}

const STORAGE_KEY = 'taskcash_mock_db';

// Hardcoded Default Data
const DEFAULT_LEVELS: Level[] = [
  { id: 'lvl_1', name: 'Explorer', cost: 0, earning_multiplier: 1.0, max_daily_ads_cat_a: 10, max_daily_ads_cat_b: 5, max_daily_ads_cat_c: 5, max_daily_tasks: 10, min_withdrawal: 30000, req_account_age: 30, req_streak: 20, req_ads: 300, req_tasks: 100, req_referrals: 0, benefits: ['Withdrawal: ₦30,000', '20 rewarded videos/day', '10 normal tasks/day', 'Standard earning rate'] },
  { id: 'lvl_2', name: 'Active', cost: 0, earning_multiplier: 1.2, max_daily_ads_cat_a: 15, max_daily_ads_cat_b: 8, max_daily_ads_cat_c: 7, max_daily_tasks: 15, min_withdrawal: 25000, req_account_age: 30, req_streak: 15, req_ads: 150, req_tasks: 50, req_referrals: 5, benefits: ['Withdrawal: ₦25,000', '30 rewarded videos/day', '15 tasks/day', 'Higher daily earning limit', '5% referral commission'] },
  { id: 'lvl_3', name: 'Pro', cost: 0, earning_multiplier: 1.5, max_daily_ads_cat_a: 20, max_daily_ads_cat_b: 10, max_daily_ads_cat_c: 10, max_daily_tasks: 20, min_withdrawal: 20000, req_account_age: 30, req_streak: 30, req_ads: 400, req_tasks: 150, req_referrals: 20, benefits: ['Withdrawal: ₦20,000', '40 rewarded videos/day', '20 tasks/day', 'Higher referral commission', 'Exclusive campaigns'] },
  { id: 'lvl_4', name: 'Elite', cost: 0, earning_multiplier: 2.0, max_daily_ads_cat_a: 30, max_daily_ads_cat_b: 15, max_daily_ads_cat_c: 15, max_daily_tasks: 30, min_withdrawal: 15000, req_account_age: 30, req_streak: 60, req_ads: 1000, req_tasks: 300, req_referrals: 50, benefits: ['Withdrawal: ₦15,000', '60 rewarded videos/day', '30 tasks/day', 'Highest earning rate', 'Priority withdrawal review', 'VIP campaigns', 'Highest referral commission'] }
];

const DEFAULT_BANKS: Bank[] = [
  { id: 'bank_opay', name: 'OPay Digital Bank', code: '999992' },
  { id: 'bank_palmpay', name: 'PalmPay', code: '999991' },
  { id: 'bank_kuda', name: 'Kuda Microfinance Bank', code: '090267' },
  { id: 'bank_gtb', name: 'Guaranty Trust Bank (GTB)', code: '000013' },
  { id: 'bank_zenith', name: 'Zenith Bank', code: '000015' },
  { id: 'bank_access', name: 'Access Bank', code: '000014' }
];

export const DEFAULT_TASK_CATEGORIES: TaskCategory[] = [
  { id: 'cat_explore', name: 'Explore & Engage', icon: 'explore' },
  { id: 'cat_telegram', name: 'Telegram', icon: 'send' },
  { id: 'cat_youtube', name: 'YouTube', icon: 'video_library' },
  { id: 'cat_tiktok', name: 'TikTok', icon: 'play_arrow' },
  { id: 'cat_x', name: 'X / Twitter', icon: 'alternate_email' }
];

export const DEFAULT_TASKS: Task[] = [
  // Explore & Engage Tasks
  { 
    id: 'task_exp_1', 
    title: 'Explore Featured Content', 
    category_id: 'cat_explore', 
    reward_amount: 250, 
    description: 'Open the featured page and explore the available content.', 
    link: 'https://omg10.com/4/7016980', 
    status: 'Active',
    badge: 'External Link',
    buttonText: 'View & Explore',
    icon: 'explore'
  },
  { 
    id: 'task_exp_2', 
    title: 'Discover Something New', 
    category_id: 'cat_explore', 
    reward_amount: 300, 
    description: 'Visit the external page and engage with content that interests you.', 
    link: 'https://omg10.com/4/11285913', 
    status: 'Active',
    badge: 'Sponsored',
    buttonText: 'Open & Discover',
    icon: 'travel_explore'
  },
  { 
    id: 'task_exp_3', 
    title: 'Visit Featured Page', 
    category_id: 'cat_explore', 
    reward_amount: 200, 
    description: 'Open this page and take a look at the content available.', 
    link: 'https://omg10.com/4/7580237', 
    status: 'Active',
    badge: 'External Link',
    buttonText: 'Visit & Explore',
    icon: 'language'
  },
  { 
    id: 'task_exp_4', 
    title: 'Explore Recommended Content', 
    category_id: 'cat_explore', 
    reward_amount: 280, 
    description: 'Visit the page and interact naturally with any content you find useful.', 
    link: 'https://omg10.com/4/7566097', 
    status: 'Active',
    badge: 'Sponsored',
    buttonText: 'Open & Engage',
    icon: 'recommend'
  },
  { 
    id: 'task_exp_5', 
    title: 'Discover a New Offer', 
    category_id: 'cat_explore', 
    reward_amount: 350, 
    description: 'Open the featured destination and learn more about what is available.', 
    link: 'https://omg10.com/4/6921286', 
    status: 'Active',
    badge: 'External Link',
    buttonText: 'Explore Offer',
    icon: 'local_offer'
  },
  { 
    id: 'task_exp_6', 
    title: 'Check Out Featured Content', 
    category_id: 'cat_explore', 
    reward_amount: 220, 
    description: 'Visit this external page and discover more.', 
    link: 'https://omg10.com/4/7580236', 
    status: 'Active',
    badge: 'Sponsored',
    buttonText: 'View Page',
    icon: 'launch'
  },

  // Standard Social Media Tasks (Initially only Join Our Telegram Community as requested)
  { 
    id: 'task_telegram_community', 
    title: 'Join Our Telegram Community', 
    category_id: 'cat_telegram', 
    reward_amount: 500, 
    description: 'Join our official Telegram news channel to get early payout alerts, daily promo codes, and updates.', 
    link: 'https://t.me/taskcash_official', 
    status: 'Active', 
    badge: 'Standard', 
    buttonText: 'Join & Claim', 
    icon: 'send' 
  }
];

const DEFAULT_ADS: RewardedAd[] = [
  { id: 'ad_inter_1', name: 'Premium Fintech Ad 1', type: 'Interstitial', category: 'A', reward_amount: 20, watch_time_sec: 15, remaining_views: 15 },
  { id: 'ad_inter_2', name: 'Crypto Gaming App Launch', type: 'Interstitial', category: 'B', reward_amount: 35, watch_time_sec: 30, remaining_views: 10 },
  { id: 'ad_pop_1', name: 'Survey Rewards Offer', type: 'Popup', category: 'C', reward_amount: 100, watch_time_sec: 45, remaining_views: 5 },
  { id: 'ad_inapp_1', name: 'Background Monetization Ad', type: 'InAppInterstitial', category: 'None', reward_amount: 0, watch_time_sec: 5, remaining_views: 999 }
];

// Helper to load database
export const loadDB = (): TaskCashDB => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed: TaskCashDB = JSON.parse(raw);
      // Ensure DEFAULT_TASK_CATEGORIES exist in parsed database
      DEFAULT_TASK_CATEGORIES.forEach(cat => {
        if (!parsed.task_categories.some(c => c.id === cat.id)) {
          parsed.task_categories.unshift(cat);
        }
      });
      // Ensure DEFAULT_TASKS exist in parsed database
      DEFAULT_TASKS.forEach(task => {
        if (!parsed.tasks.some(t => t.id === task.id)) {
          parsed.tasks.push(task);
        }
      });
      return parsed;
    } catch (e) {
      console.error('Failed to parse mock database, resetting...', e);
    }
  }

  // Generate initial database
  const db: TaskCashDB = {
    users: [
      {
        id: 'usr_willie',
        username: 'willie_earn',
        first_name: 'Willie',
        last_name: 'Obi',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVTKlyggqz5sCXesavqzKPCSJ4KXoCGlgCc8lz_jaPYv_5AQRavF-pvfr6PwucqaXWhwc6Cpw4vfXffqz_cXEk6H0CTtrwG1Kntsj-GR9YG9PNUuq320uFZxButjHsDwLSNPGeUJ2tTsOrGMkV6eDMkbdzqGzC10Ot2XT6vYjQHIJfnbizlg0JjUhc8GgrTm3h3YH68e4e3H_Tr_JAKMrVndxN_nktv37HXYWp6FOKBaHnR5WKMV8q',
        registered_at: new Date().toISOString(),
        referrer_id: null,
        status: 'Active',
        level_id: 'lvl_1', // New user is Level 1 Free
        is_premium: false,
        email_verified: false,
        phone_verified: false,
        login_streak: 1,
        total_ads_watched: 0,
        total_tasks_completed: 0
      }
    ],
    wallets: [
      {
        id: 'wall_willie',
        user_id: 'usr_willie',
        active_balance: 0,
        lifetime_earnings: 0
      }
    ],
    transactions: [],
    levels: DEFAULT_LEVELS,
    tasks: DEFAULT_TASKS,
    task_categories: DEFAULT_TASK_CATEGORIES,
    rewarded_ads: DEFAULT_ADS,
    ad_views: [],
    daily_rewards: [],
    withdrawal_requests: [],
    banks: DEFAULT_BANKS,
    notifications: [
      { id: 'nt_2', user_id: 'usr_willie', title: 'Welcome to TaskCash!', message: 'Start earning today by watching ads and completing easy social tasks!', read: false, type: 'System', created_at: new Date().toISOString() }
    ],
    referrals: [],
    referral_earnings: [],
    achievements: [],
    activity_logs: [
      { id: 'log_1', user_id: 'usr_willie', action: 'User logged in', ip: '102.89.44.11', user_agent: 'TelegramMobile/10.9 (iPhone)', timestamp: new Date().toISOString() }
    ],
    admin_users: [
      { id: 'adm_1', username: 'admin', role: 'Admin' }
    ],
    system_settings: [
      { id: 'st_1', key: 'min_withdrawal_l1', value: '2000' },
      { id: 'st_2', key: 'withdrawal_fee_percent', value: '5' },
      { id: 'st_3', key: 'maintenance_mode', value: 'false' },
      { id: 'st_4', key: 'fraud_detection_level', value: 'High' },
      { id: 'st_5', key: 'reward_cat_A', value: '20' },
      { id: 'st_6', key: 'enabled_cat_A', value: 'true' },
      { id: 'st_7', key: 'cooldown_cat_A', value: '15' },
      { id: 'st_8', key: 'reward_cat_B', value: '35' },
      { id: 'st_9', key: 'enabled_cat_B', value: 'true' },
      { id: 'st_10', key: 'cooldown_cat_B', value: '30' },
      { id: 'st_11', key: 'reward_cat_C', value: '100' },
      { id: 'st_12', key: 'enabled_cat_C', value: 'true' },
      { id: 'st_13', key: 'cooldown_cat_C', value: '45' },
      { id: 'st_14', key: 'referral_active_ads_req', value: '10' },
      { id: 'st_15', key: 'referral_commission_l1', value: '0' },
      { id: 'st_16', key: 'referral_commission_l2', value: '5' },
      { id: 'st_17', key: 'referral_commission_l3', value: '10' },
      { id: 'st_18', key: 'referral_commission_l4', value: '15' }
    ],
    advertisements: [
      { id: 'adv_1', title: 'Vite Sponsor Banner', type: 'Banner', link: 'https://vitejs.dev', budget: 150000, status: 'Active' }
    ],
    sdk_logs: [],
    postback_logs: [],
    fraud_logs: [],
    user_bank_details: [],
    referral_milestones: [
      { id: 'milestone_1', required_referrals: 5, reward_amount: 1000, title: '5 Active Referrals' },
      { id: 'milestone_2', required_referrals: 20, reward_amount: 5000, title: '20 Active Referrals' },
      { id: 'milestone_3', required_referrals: 50, reward_amount: 15000, title: '50 Active Referrals' }
    ]
  };

  saveDB(db);
  return db;
};

// Save Database Helper
export const saveDB = (db: TaskCashDB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('taskcash_db_update', { detail: { timestamp: Date.now() } }));
  }
};

// Update Database Operations Helper
export const updateDB = (updater: (db: TaskCashDB) => void): TaskCashDB => {
  const db = loadDB();
  updater(db);
  saveDB(db);
  return db;
};

// Transactional Rewards Engine
export const addTransaction = (
  userId: string,
  type: Transaction['type'],
  amount: number,
  description: string,
  status: Transaction['status'] = 'Success'
): { db: TaskCashDB; tx: Transaction } => {
  const txId = 'tx_' + Math.random().toString(36).substr(2, 9);
  const tx: Transaction = {
    id: txId,
    wallet_id: 'wall_' + userId.split('_')[1],
    type,
    amount,
    status,
    description,
    timestamp: new Date().toISOString()
  };

  const updated = updateDB((db) => {
    // 1. Add Transaction
    db.transactions.unshift(tx);

    // 2. Update Wallet (only if transaction succeeded)
    if (status === 'Success') {
      const wallet = db.wallets.find(w => w.user_id === userId);
      if (wallet) {
        if (type === 'Withdrawal' || type === 'LevelUpgrade') {
          wallet.active_balance -= amount;
        } else if (type !== 'AdViewImpressions') {
          wallet.active_balance += amount;
          wallet.lifetime_earnings += amount;
        }
      }
    }
  });

  return { db: updated, tx };
};
