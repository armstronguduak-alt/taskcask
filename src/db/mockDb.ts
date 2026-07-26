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
  max_daily_ads: number;
  max_daily_tasks: number;
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
}

const STORAGE_KEY = 'taskcash_mock_db';

// Hardcoded Default Data
const DEFAULT_LEVELS: Level[] = [
  { id: 'lvl_1', name: 'Level 1 Free', cost: 0, earning_multiplier: 1.0, max_daily_ads: 20, max_daily_tasks: 30, benefits: ['Standard support', 'Minimum withdrawal: ₦2,000', '1.0x Earning factor'] },
  { id: 'lvl_2', name: 'Level 2 Premium', cost: 5000, earning_multiplier: 1.5, max_daily_ads: 35, max_daily_tasks: 45, benefits: ['Priority support', 'Minimum withdrawal: ₦1,000', '1.5x Earning factor', 'Unlocked High-Yield ads'] },
  { id: 'lvl_3', name: 'Level 3 Pro', cost: 10000, earning_multiplier: 2.0, max_daily_ads: 50, max_daily_tasks: 60, benefits: ['Vanguard support', 'Minimum withdrawal: ₦500', '2.0x Earning factor', 'Zero withdrawal fees'] },
  { id: 'lvl_4', name: 'Level 4 Elite', cost: 20000, earning_multiplier: 2.5, max_daily_ads: 70, max_daily_tasks: 80, benefits: ['Executive support', 'Instant bank settlement', '2.5x Earning factor', 'Exclusive social tasks'] },
  { id: 'lvl_vip', name: 'VIP Legend', cost: 50000, earning_multiplier: 4.0, max_daily_ads: 100, max_daily_tasks: 100, benefits: ['Personal accounts manager', 'Instant settlement', '4.0x Earning factor', 'No withdrawal limits'] }
];

const DEFAULT_BANKS: Bank[] = [
  { id: 'bank_opay', name: 'OPay Digital Bank', code: '999992' },
  { id: 'bank_palmpay', name: 'PalmPay', code: '999991' },
  { id: 'bank_kuda', name: 'Kuda Microfinance Bank', code: '090267' },
  { id: 'bank_gtb', name: 'Guaranty Trust Bank (GTB)', code: '000013' },
  { id: 'bank_zenith', name: 'Zenith Bank', code: '000015' },
  { id: 'bank_access', name: 'Access Bank', code: '000014' }
];

const DEFAULT_TASK_CATEGORIES: TaskCategory[] = [
  { id: 'cat_tiktok', name: 'TikTok', icon: 'play_arrow' },
  { id: 'cat_youtube', name: 'YouTube', icon: 'video_library' },
  { id: 'cat_telegram', name: 'Telegram', icon: 'send' },
  { id: 'cat_x', name: 'X / Twitter', icon: 'alternate_email' }
];

const DEFAULT_TASKS: Task[] = [
  { id: 'task_1', title: 'Follow TaskCash Telegram Channel', category_id: 'cat_telegram', reward_amount: 150, description: 'Join our official Telegram news channel to get early payout alerts and promo codes.', link: 'https://t.me/taskcash_official', status: 'Active' },
  { id: 'task_2', title: 'Subscribe to YouTube channel', category_id: 'cat_youtube', reward_amount: 250, description: 'Subscribe to our official YouTube channel, like our latest dashboard tutorial, and turn on notifications.', link: 'https://youtube.com', status: 'Active' },
  { id: 'task_3', title: 'Like & Comment on TikTok video', category_id: 'cat_tiktok', reward_amount: 200, description: 'Follow our account, like our pinned video, and leave a positive comment about your earning experience.', link: 'https://tiktok.com', status: 'Active' },
  { id: 'task_4', title: 'Retweet pinned post on X', category_id: 'cat_x', reward_amount: 180, description: 'Follow our handle, like, and retweet the pinned post about Level 4 VIP upgrade perks.', link: 'https://x.com', status: 'Active' },
  { id: 'task_5', title: 'Share referral banner on Telegram groups', category_id: 'cat_telegram', reward_amount: 300, description: 'Forward the referral promotional banner to 3 active make-money groups and verify proof.', link: 'https://t.me/share', status: 'Active' }
];

const DEFAULT_ADS: RewardedAd[] = [
  { id: 'ad_inter_1', name: 'Premium Fintech Ad 1', type: 'Interstitial', reward_amount: 20, watch_time_sec: 15, remaining_views: 15 },
  { id: 'ad_inter_2', name: 'Crypto Gaming App Launch', type: 'Interstitial', reward_amount: 35, watch_time_sec: 30, remaining_views: 10 },
  { id: 'ad_pop_1', name: 'Survey Rewards Offer', type: 'Popup', reward_amount: 100, watch_time_sec: 45, remaining_views: 5 },
  { id: 'ad_inapp_1', name: 'Background Monetization Ad', type: 'InAppInterstitial', reward_amount: 0, watch_time_sec: 5, remaining_views: 999 }
];

// Helper to load database
export const loadDB = (): TaskCashDB => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
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
        level_id: 'lvl_1' // New user is Level 1 Free
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
      { id: 'st_4', key: 'fraud_detection_level', value: 'High' }
    ],
    advertisements: [
      { id: 'adv_1', title: 'Vite Sponsor Banner', type: 'Banner', link: 'https://vitejs.dev', budget: 150000, status: 'Active' }
    ],
    sdk_logs: [],
    postback_logs: [],
    fraud_logs: []
  };

  saveDB(db);
  return db;
};

// Save Database Helper
export const saveDB = (db: TaskCashDB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
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
