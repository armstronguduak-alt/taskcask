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

import { triggerHaptic, initGlobalHapticListener } from '../utils/haptic';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { SupabaseService } from '../services/supabaseService';
import { TelegramAuthService } from '../services/telegramAuthService';

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
  completeAd: (ad: RewardedAd) => Promise<void>;
  setActiveAd: (ad: RewardedAd | null) => void;
  triggerInAppAd: (onComplete: () => void) => void;
  submitTaskProof: (taskId: string, username: string) => Promise<{ success: boolean; message: string }>;
  claimDailyBonus: () => void;
  claimWelcomeBonus: () => void;
  claimCommunityBonus: () => void;
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
  const dailyStreakDay = user?.login_streak || 1;

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
        setTaskCategories([
          { id: 'cat_official', name: 'Official', icon: 'verified' },
          { id: 'cat_extra', name: 'Extra Tasks', icon: 'stars' }
        ]);
        
        setRewardedAds([
          { id: 'ad_connect', name: 'Connect wallet', type: 'wallet', category: 'Official', reward_type: 'SB', reward_amount: 30000, watch_time_sec: 0, remaining_views: 1 },
          { id: 'ad_monetag1', name: 'Click on the Ad after viewing', type: 'monetag', category: 'Official', reward_type: 'SB', reward_amount: 30000, watch_time_sec: 15, remaining_views: 1 },
          { id: 'ad_monetag2', name: 'Watch and click on ads', type: 'monetag', category: 'Official', reward_type: 'USDT', reward_amount: 0.05, watch_time_sec: 30, remaining_views: 1 },
          { id: 'ad_giga', name: 'Watch the Giga AD', type: 'giga', category: 'Official', reward_type: 'SB', reward_amount: 30000, watch_time_sec: 45, remaining_views: 1 },
          { id: 'ad_video', name: 'View video, then tap the AD', type: 'video', category: 'Official', reward_type: 'USDT', reward_amount: 0.10, watch_time_sec: 60, remaining_views: 1 }
        ]);

        setTasks([
          { id: 't_ton1', title: 'Make TON transaction', category_id: 'cat_extra', reward_type: 'USDT', reward_amount: 2.5, description: 'Send TON to partner address', link: '#', status: 'Active', badge: 'Sponsored', button_text: 'Complete Task', icon: 'ton_yellow' },
          { id: 't_star1', title: 'Donate Stars', category_id: 'cat_extra', reward_type: 'SB', reward_amount: 4000, description: 'Donate stars on Telegram', link: '#', status: 'Active', badge: 'Sponsored', button_text: 'Complete Task', icon: 'star_yellow' },
          { id: 't_tg_join', title: 'Join Telegram channel', category_id: 'cat_community', reward_type: 'SB', reward_amount: 1500, description: 'Join our official community', link: '#', status: 'Active', badge: 'Standard', button_text: 'Complete Task', icon: 'globe' },
          { id: 't_wa_join', title: 'Join WhatsApp group', category_id: 'cat_community', reward_type: 'USDT', reward_amount: 0.2, description: 'Join WhatsApp for alerts', link: '#', status: 'Active', badge: 'Standard', button_text: 'Complete Task', icon: 'globe' },
          { id: 't_visit', title: 'Visit partner website', category_id: 'cat_engagement', reward_type: 'SB', reward_amount: 10000, description: 'Visit and stay for 60 seconds', link: '#', status: 'Active', badge: 'Standard', button_text: 'Complete Task', icon: 'explore' },
          { id: 't_read', title: 'Read content', category_id: 'cat_engagement', reward_type: 'USDT', reward_amount: 0.05, description: 'Read the latest blog post', link: '#', status: 'Active', badge: 'Standard', button_text: 'Complete Task', icon: 'explore' }
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
      // AdService.initInAppInterstitial();

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
              first_name: 'Mock',
              last_name: 'User',
              username: 'mock_user',
              registered_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'Active',
              level_id: 'lvl_1',
              is_premium: false,
              email_verified: false,
              phone_verified: false,
              login_streak: 1,
              total_ads_watched: 0,
              total_tasks_completed: 0
           } as User);
           setMainWallet({
              id: 'wall_main',
              user_id: 'usr_mock',
              wallet_type: 'Main',
              balance_sb: 30500,
              balance_usdt: 25.5,
              lifetime_sb: 30500,
              lifetime_usdt: 25.5,
              updated_at: new Date().toISOString()
           });
           setAffiliateWallet({
              id: 'wall_aff',
              user_id: 'usr_mock',
              wallet_type: 'Affiliate',
              balance_sb: 12500,
              balance_usdt: 0,
              lifetime_sb: 12500,
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
    setActiveTab('Dashboard');
  };

  const playAd = async (ad: RewardedAd) => {
    // Disabled for now based on user request
    alert('Ads are temporarily disabled.');
    return;
  };

  const completeAd = async (ad: RewardedAd) => {
    // Call RPC to credit reward
    if (user && isSupabaseConfigured()) {
       await SupabaseService.creditWalletRPC(user.id, 'WatchReward', ad.reward_amount, `Watched Ad: ${ad.name}`);
       refreshState();
    }
    setActiveAd(null);
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
    refreshState();
    return { success: true, message: `Task submitted! Reward added to balance.` };
  };

  const claimDailyBonus = () => {
     if (user && isSupabaseConfigured()) {
       SupabaseService.creditWalletRPC(user.id, 'DailyReward', 50, 'Daily Login Reward');
       refreshState();
     }
  };

  const claimWelcomeBonus = () => {
    if (localStorage.getItem('welcome_bonus_claimed')) return;
    localStorage.setItem('welcome_bonus_claimed', 'true');
    if (user && isSupabaseConfigured()) {
       SupabaseService.creditWalletRPC(user.id, 'DailyReward', 500, 'Welcome Bonus');
       refreshState();
    }
  };

  const claimCommunityBonus = () => {
    if (localStorage.getItem('community_bonus_claimed')) return;
    localStorage.setItem('community_bonus_claimed', 'true');
    if (user && isSupabaseConfigured()) {
       SupabaseService.creditWalletRPC(user.id, 'TaskReward', 500, 'Join Our Community');
       refreshState();
    }
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
