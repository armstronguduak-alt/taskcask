import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  User,
  Wallet,
  Transaction,
  Level,
  Task,
  RewardedAd,
  WithdrawalRequest,
  Bank,
  Notification,
  Referral,
  TaskCategory,
  SystemSetting,
  TabName
} from '../types';

import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { SupabaseService } from '../services/supabaseService';
import { TelegramAuthService } from '../services/telegramAuthService';
import { AdService } from '../services/AdService';
import { triggerHaptic, initGlobalHapticListener } from '../utils/haptic';

interface AppContextProps {
  user: User | null;
  mainWallet: Wallet | null;
  affiliateWallet: Wallet | null;
  transactions: Transaction[];
  levels: Level[];
  tasks: Task[];
  taskCategories: TaskCategory[];
  rewardedAds: RewardedAd[];
  withdrawalRequests: WithdrawalRequest[];
  banks: Bank[];
  notifications: Notification[];
  referrals: Referral[];
  systemSettings: SystemSetting[];

  isLoading: boolean;
  onboardingCompleted: boolean;
  activeTab: TabName;
  activeAd: RewardedAd | null;

  // Settings
  darkMode: boolean;

  // Daily Bonus
  hasClaimedDailyBonus: boolean;
  dailyStreakDay: number;

  // Methods
  refreshState: () => void;
  setTab: (tab: TabName) => void;
  skipOnboarding: () => void;
  playAd: (ad: RewardedAd) => void;
  completeAd: (ad: RewardedAd) => Promise<{ success: boolean; amount?: number; currency?: 'SB' | 'USDT' }>;
  setActiveAd: (ad: RewardedAd | null) => void;
  triggerInAppAd: (onComplete: () => void) => void;
  submitTaskProof: (taskId: string, username: string) => Promise<{ success: boolean; message: string; amount?: number; currency?: 'SB' | 'USDT' }>;
  claimDailyBonus: () => Promise<{ success: boolean; amount?: number; currency?: 'SB' | 'USDT' }>;
  claimWelcomeBonus: () => Promise<{ success: boolean; amount?: number; currency?: 'SB' | 'USDT' }>;
  claimCommunityBonus: () => Promise<{ success: boolean; amount?: number; currency?: 'SB' | 'USDT' }>;
  verifyEmail: () => void;
  verifyPhone: () => void;
  saveBankDetails: (bankId: string, accountNum: string, accountName: string) => void;
  requestWithdrawal: (walletType: 'Main' | 'Affiliate', currency: 'SB' | 'USDT', bankId: string | null, accountNum: string | null, accountName: string | null, trc20Address: string | null, amount: number) => Promise<{ success: boolean; message: string }>;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [mainWallet, setMainWallet] = useState<Wallet | null>(null);
  const [affiliateWallet, setAffiliateWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>([]);
  const [rewardedAds, setRewardedAds] = useState<RewardedAd[]>([]);
  const [withdrawalRequests, _setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [referrals, _setReferrals] = useState<Referral[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);

  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem('swagbucks_onboarding_done') === 'true';
  });

  const [activeAd, setActiveAd] = useState<RewardedAd | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('swagbucks_theme') === 'dark';
  });

  const hasClaimedDailyBonus = false; // Add logic based on daily_rewards table
  const dailyStreakDay = user?.login_streak ?? 0;

  const refreshState = async () => {
    if (!isSupabaseConfigured() || !user) return;

    try {
      const [
        { data: userData },
        { data: walletsData },
        { data: txData },
        { data: notificationsData },
      ] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('wallets').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('timestamp', { ascending: false }),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (userData) setUser(userData as User);
      if (walletsData) {
        setMainWallet((walletsData.find((w: any) => w.wallet_type === 'Main') as Wallet) || null);
        setAffiliateWallet((walletsData.find((w: any) => w.wallet_type === 'Affiliate') as Wallet) || null);
      }
      if (txData) setTransactions(txData as Transaction[]);
      if (notificationsData) setNotifications(notificationsData as Notification[]);
    } catch (e) {
      console.error("Error refreshing state", e);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);

      // Load static data
      if (isSupabaseConfigured()) {
        const [
          { data: levelsData },
          { data: tasksData },
          { data: categoriesData },
          { data: adsData },
          { data: settingsData },
          { data: banksData }
        ] = await Promise.all([
          supabase.from('levels').select('*'),
          supabase.from('tasks').select('*').eq('status', 'Active'),
          supabase.from('task_categories').select('*'),
          supabase.from('rewarded_ads').select('*'),
          supabase.from('system_settings').select('*'),
          supabase.from('banks').select('*')
        ]);

        if (levelsData) setLevels(levelsData as Level[]);
        if (tasksData) setTasks(tasksData as Task[]);
        if (categoriesData) setTaskCategories(categoriesData as TaskCategory[]);
        if (adsData) setRewardedAds(adsData as RewardedAd[]);
        if (settingsData) setSystemSettings(settingsData as SystemSetting[]);
        if (banksData) setBanks(banksData as Bank[]);
      } else {
        // Mock data for UI development
        setLevels([
          { id: 'lvl_1', name: 'Silver', cost: 0, earning_multiplier: 1.0, max_daily_ads_cat_a: 5, max_daily_ads_cat_b: 5, max_daily_ads_cat_c: 5, max_daily_tasks: 5, min_withdrawal_sb: 30000, min_withdrawal_usdt: 20, req_account_age: 0, req_streak: 0, req_ads: 0, req_tasks: 0, req_referrals: 0, benefits: ['Basic Tasks'] },
          { id: 'lvl_2', name: 'Gold', cost: 1000, earning_multiplier: 1.5, max_daily_ads_cat_a: 10, max_daily_ads_cat_b: 10, max_daily_ads_cat_c: 10, max_daily_tasks: 10, min_withdrawal_sb: 20000, min_withdrawal_usdt: 15, req_account_age: 7, req_streak: 7, req_ads: 20, req_tasks: 10, req_referrals: 2, benefits: ['Premium Tasks', 'Lower Withdrawal limit'] },
          { id: 'lvl_3', name: 'Diamond', cost: 5000, earning_multiplier: 2.0, max_daily_ads_cat_a: 20, max_daily_ads_cat_b: 20, max_daily_ads_cat_c: 20, max_daily_tasks: 20, min_withdrawal_sb: 10000, min_withdrawal_usdt: 10, req_account_age: 30, req_streak: 30, req_ads: 100, req_tasks: 50, req_referrals: 10, benefits: ['All Tasks', 'Priority Support', 'Lowest Withdrawal'] },
          { id: 'lvl_4', name: 'Ruby', cost: 10000, earning_multiplier: 3.0, max_daily_ads_cat_a: 30, max_daily_ads_cat_b: 30, max_daily_ads_cat_c: 30, max_daily_tasks: 30, min_withdrawal_sb: 5000, min_withdrawal_usdt: 5, req_account_age: 60, req_streak: 60, req_ads: 200, req_tasks: 100, req_referrals: 20, benefits: ['VIP Exclusive Tasks', 'Instant Withdrawals'] }
        ]);
        setTaskCategories([
          { id: 'cat_official', name: 'Official', icon: 'verified' },
          { id: 'cat_extra', name: 'Extra Tasks', icon: 'stars' }
        ]);

        setRewardedAds([
          { id: 'ad_monetag1', name: 'Click on the Ad after viewing', type: 'monetag', category: 'Official', reward_type: 'SB', reward_amount: 50, watch_time_sec: 15, remaining_views: 1 },
          { id: 'ad_monetag2', name: 'Watch and click on ads', type: 'monetag', category: 'Official', reward_type: 'USDT', reward_amount: 0.05, watch_time_sec: 30, remaining_views: 1 },
          { id: 'ad_giga', name: 'Watch the Giga AD', type: 'giga', category: 'Official', reward_type: 'SB', reward_amount: 50, watch_time_sec: 45, remaining_views: 1 },
          { id: 'ad_video', name: 'View video, then tap the AD', type: 'video', category: 'Official', reward_type: 'USDT', reward_amount: 0.10, watch_time_sec: 60, remaining_views: 1 }
        ]);

        setTasks([
          { id: 't_tg_join', title: 'Join Telegram channel', category_id: 'cat_community', reward_type: 'SB', reward_amount: 500, description: 'Join our official community', link: 'https://t.me/taskcash_official', status: 'Active', badge: 'Standard', button_text: 'Join', icon: 'globe' },
          { id: 't_wa_join', title: 'Join WhatsApp group', category_id: 'cat_community', reward_type: 'USDT', reward_amount: 0.2, description: 'Join WhatsApp for alerts', link: 'https://whatsapp.com/channel/0029Vb8KUjXEquiYaU8JqQ45', status: 'Active', badge: 'Standard', button_text: 'Join', icon: 'globe' },
          { id: 't_visit', title: 'Visit Website', category_id: 'cat_engagement', reward_type: 'SB', reward_amount: 100, description: 'Open the partner page and interact with the content.', link: 'https://www.effectivecpmnetwork.com/h0cq93109?key=c4b5e80c407ee733eb7a534c655bf22b', status: 'Active', badge: 'Standard', button_text: 'Explore', icon: 'explore' },
          { id: 't_read', title: 'Explore Content', category_id: 'cat_engagement', reward_type: 'SB', reward_amount: 150, description: 'Explore premium content.', link: 'https://link.gigapub.tech/l/cynz40gvg', status: 'Active', badge: 'Standard', button_text: 'Explore', icon: 'explore' },
          { id: 't_stay', title: 'Stay 30 Seconds', category_id: 'cat_engagement', reward_type: 'SB', reward_amount: 200, description: 'Stay on the page for 30 seconds.', link: '#', status: 'Active', badge: 'Standard', button_text: 'Start', icon: 'explore' },
          { id: 't_partner', title: 'Partner Task', category_id: 'cat_engagement', reward_type: 'USDT', reward_amount: 0.20, description: 'Complete the partner task.', link: '#', status: 'Active', badge: 'Standard', button_text: 'Complete', icon: 'explore' }
        ]);

        setBanks([
          { id: 'bank_opay', name: 'OPAY (Popular)', code: '000000' },
          { id: 'bank_palmpay', name: 'PalmPay (Popular)', code: '000000' },
          { id: 'bank_first', name: 'First Bank', code: '000000' },
          { id: 'bank_access', name: 'Access Bank', code: '000000' },
          { id: 'bank_uba', name: 'UBA', code: '000000' },
          { id: 'bank_gtb', name: 'GTBank', code: '000000' },
          { id: 'bank_fcmb', name: 'FCMB', code: '000000' },
          { id: 'bank_union', name: 'Union Bank', code: '000000' }
        ]);
      }

      // Initialize Telegram
      initGlobalHapticListener();
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();

        if (tg.initDataUnsafe?.user) {
          try {
            const authResponse = await TelegramAuthService.authenticateTelegramUser();
            if (authResponse.success && authResponse.user) {
              setUser(authResponse.user as User);

              if (isSupabaseConfigured()) {
                const { data: walletsData } = await supabase.from('wallets').select('*').eq('user_id', authResponse.user.id);
                if (walletsData) {
                  setMainWallet((walletsData.find((w: any) => w.wallet_type === 'Main') as Wallet) || null);
                  setAffiliateWallet((walletsData.find((w: any) => w.wallet_type === 'Affiliate') as Wallet) || null);
                }
                const { data: txData } = await supabase.from('transactions').select('*').eq('user_id', authResponse.user.id).order('timestamp', { ascending: false });
                if (txData) setTransactions(txData as Transaction[]);
              }
            }
          } catch (e) {
            console.error("Auth failed", e);
          }
        } else {
          // Mock user for local testing without Telegram
          console.warn("No Telegram initDataUnsafe found. Using mock user.");
          setUser({
            id: 'usr_mock',
            telegram_id: 123456789,
            first_name: 'User',
            last_name: '',
            username: 'username',
            registered_at: new Date().toISOString(),
            status: 'Active',
            level_id: 'lvl_1',
            is_premium: false,
            email_verified: false,
            phone_verified: false,
            login_streak: 0,
            total_ads_watched: 0,
            total_tasks_completed: 0
          } as User);
          setMainWallet({
            id: 'wall_main',
            user_id: 'usr_mock',
            wallet_type: 'Main',
            balance_sb: 0,
            balance_usdt: 0,
            lifetime_sb: 0,
            lifetime_usdt: 0,
            updated_at: new Date().toISOString()
          });
          setAffiliateWallet({
            id: 'wall_aff',
            user_id: 'usr_mock',
            wallet_type: 'Affiliate',
            balance_sb: 0,
            balance_usdt: 0,
            lifetime_sb: 0,
            lifetime_usdt: 0,
            updated_at: new Date().toISOString()
          });
        }
      }
      setIsLoading(false);
    };

    initApp();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('swagbucks_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('swagbucks_theme', 'light');
    }
  }, [darkMode]);

  const setTab = (tab: TabName) => {
    triggerHaptic('selection');
    setActiveTab(tab);
  };

  const skipOnboarding = () => {
    localStorage.setItem('swagbucks_onboarding_done', 'true');
    setOnboardingCompleted(true);
    setActiveTab('Home');
  };

  const playAd = async (ad: RewardedAd) => {
    const success = await AdService.executeWatchAndEarnAd();
    if (success) {
      await completeAd(ad);
    }
  };

  const completeAd = async (ad: RewardedAd) => {
    // Call RPC to credit reward
    if (user && isSupabaseConfigured()) {
      await SupabaseService.creditWalletRPC(user.id, 'WatchReward', ad.reward_amount, `Watched Ad: ${ad.name}`);
      setActiveAd(null);
      return { success: true, amount: ad.reward_amount, currency: 'SB' as const };
    }
    setActiveAd(null);
    return { success: false };
  };

  const triggerInAppAd = (onComplete: () => void) => {
    // Disabled for now
    onComplete();
  };

  const submitTaskProof = async (taskId: string, username: string) => {
    if (!user || !isSupabaseConfigured()) return { success: false, message: 'Not connected' };
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Task not found' };

    await SupabaseService.submitTaskProofDB(user.id, taskId, username);
    await SupabaseService.creditWalletRPC(user.id, 'TaskReward', task.reward_amount, `Completed Task: ${task.title}`);
    return { success: true, message: `Task submitted! Reward added to balance.`, amount: task.reward_amount, currency: (task.reward_type || 'SB') as 'SB' | 'USDT' };
  };

  const claimDailyBonus = async () => {
    if (user && isSupabaseConfigured()) {
      const currentDay = dailyStreakDay || 1;
      const dayInWeek = ((currentDay - 1) % 7) + 1;

      let amount = 100;
      let currency: 'SB' | 'USDT' = 'SB';

      if (dayInWeek === 3) { amount = 0.05; currency = 'USDT'; }
      else if (dayInWeek === 5) { amount = 0.25; currency = 'USDT'; }
      else if (dayInWeek === 7) { amount = 150; currency = 'SB'; }

      await SupabaseService.creditWalletRPC(user.id, 'DailyReward', amount, `Daily Login Reward - Day ${currentDay}`);
      return { success: true, amount, currency };
    }
    return { success: false };
  };

  const claimWelcomeBonus = async () => {
    if (localStorage.getItem('welcome_bonus_claimed')) return { success: false };
    localStorage.setItem('welcome_bonus_claimed', 'true');
    if (user && isSupabaseConfigured()) {
      await SupabaseService.creditWalletRPC(user.id, 'DailyReward', 500, 'Welcome Bonus');
      return { success: true, amount: 500, currency: 'SB' as const };
    }
    return { success: false };
  };

  const claimCommunityBonus = async () => {
    if (localStorage.getItem('community_bonus_claimed')) return { success: false };
    localStorage.setItem('community_bonus_claimed', 'true');
    if (user && isSupabaseConfigured()) {
      await SupabaseService.creditWalletRPC(user.id, 'TaskReward', 500, 'Join Our Community');
      return { success: true, amount: 500, currency: 'SB' as const };
    }
    return { success: false };
  };

  const verifyEmail = () => {
    // Update Supabase
  };

  const verifyPhone = () => {
    // Update Supabase
  };

  const saveBankDetails = (_bankId: string, _accountNum: string, _accountName: string) => {
    // Update Supabase
  };

  const requestWithdrawal = async (
    walletType: 'Main' | 'Affiliate',
    currency: 'SB' | 'USDT',
    bankId: string | null,
    accountNum: string | null,
    accountName: string | null,
    _trc20Address: string | null,
    amount: number
  ) => {
    if (!user || !isSupabaseConfigured()) return { success: false, message: 'Not configured' };

    // Check balances locally
    const wallet = walletType === 'Main' ? mainWallet : affiliateWallet;
    if (!wallet) return { success: false, message: 'Wallet not found' };

    const balance = currency === 'SB' ? wallet.balance_sb : wallet.balance_usdt;
    if (balance < amount) return { success: false, message: 'Insufficient balance' };

    const res = await SupabaseService.requestWithdrawalRPC(
      user.id,
      bankId || '',
      accountNum || '',
      accountName || '',
      amount
    );
    refreshState();

    return { success: res.success, message: res.message || 'Withdrawal requested' };
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AppContext.Provider value={{
      user, mainWallet, affiliateWallet, transactions, levels, tasks, taskCategories,
      rewardedAds, withdrawalRequests, banks, notifications, referrals, systemSettings,
      isLoading, onboardingCompleted, activeTab, activeAd, darkMode, hasClaimedDailyBonus, dailyStreakDay,
      refreshState, setTab, skipOnboarding, playAd, completeAd, setActiveAd, triggerInAppAd,
      submitTaskProof, claimDailyBonus, claimWelcomeBonus, claimCommunityBonus, verifyEmail, verifyPhone,
      saveBankDetails, requestWithdrawal, toggleDarkMode
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
