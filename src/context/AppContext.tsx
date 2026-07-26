import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  loadDB, 
  updateDB, 
  addTransaction
} from '../db/mockDb';
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
  FraudLog,
  PostbackLog,
  SdkLog,
  TaskCategory
} from '../db/mockDb';
import { AdService } from '../services/AdService';

export type TabName = 'Dashboard' | 'Tasks' | 'WatchEarn' | 'Invite' | 'Profile' | 'Premium' | 'Withdraw' | 'History' | 'Admin' | 'Onboarding';

interface AppContextProps {
  user: User | null;
  wallet: Wallet | null;
  transactions: Transaction[];
  levels: Level[];
  tasks: Task[];
  taskCategories: TaskCategory[];
  rewardedAds: RewardedAd[];
  withdrawalRequests: WithdrawalRequest[];
  banks: Bank[];
  notifications: Notification[];
  referrals: Referral[];
  fraudLogs: FraudLog[];
  postbackLogs: PostbackLog[];
  sdkLogs: SdkLog[];
  
  onboardingCompleted: boolean;
  activeTab: TabName;
  activeAd: RewardedAd | null;
  adProgress: number;
  adPlaying: boolean;
  
  // Settings
  darkMode: boolean;
  
  // Methods
  setTab: (tab: TabName) => void;
  skipOnboarding: () => void;
  playAd: (ad: RewardedAd) => void;
  triggerInAppAd: (onComplete: () => void) => void;
  submitTaskProof: (taskId: string, username: string) => Promise<{ success: boolean; message: string }>;
  claimDailyBonus: () => void;
  claimWelcomeBonus: () => void;
  claimCommunityBonus: () => void;
  togglePremium: () => void;
  verifyEmail: () => void;
  verifyPhone: () => void;
  requestWithdrawal: (bankId: string, accountNum: string, accountName: string, amount: number) => { success: boolean; message: string };
  toggleDarkMode: () => void;
  
  // Admin Methods
  approveWithdrawal: (id: string) => void;
  rejectWithdrawal: (id: string) => void;
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  resetDatabase: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dbState, setDbState] = useState(() => loadDB());
  const [activeTab, setActiveTab] = useState<TabName>('Onboarding');
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem('taskcash_onboarding_done') === 'true';
  });
  
  const [activeAd, setActiveAd] = useState<RewardedAd | null>(null);
  const [adProgress, setAdProgress] = useState(0);
  const [adPlaying, setAdPlaying] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('taskcash_theme') === 'dark';
  });

  const currentUser = dbState.users.find(u => u.id === 'usr_willie') || null;
  const currentWallet = dbState.wallets.find(w => w.user_id === 'usr_willie') || null;
  const userTransactions = dbState.transactions.filter(t => t.wallet_id === 'wall_willie');

  const checkAutoLevelUp = () => {
    updateDB((db) => {
      const user = db.users.find(u => u.id === 'usr_willie');
      if (!user) return;
      
      const streak = user.login_streak || 0;
      const ads = user.total_ads_watched || 0;
      const tasks = user.total_tasks_completed || 0;
      
      // Determine highest eligible level (levels are assumed sorted 1 to 4)
      const eligibleLevel = db.levels.slice().reverse().find(l => 
        streak >= l.req_streak && ads >= l.req_ads && tasks >= l.req_tasks
      );
      
      if (eligibleLevel && eligibleLevel.id !== user.level_id) {
        user.level_id = eligibleLevel.id;
        db.notifications.unshift({
          id: 'nt_up_' + Math.random().toString(36).substr(2, 9),
          user_id: 'usr_willie',
          title: 'Account Level Upgraded!',
          message: `Congratulations! Your activity has earned you a promotion to ${eligibleLevel.name}. Earning multiplier set to ${eligibleLevel.earning_multiplier}x.`,
          read: false,
          type: 'System',
          created_at: new Date().toISOString()
        });
        
        const tg = (window as any).Telegram?.WebApp;
        if (tg && tg.showAlert) {
          tg.showAlert(`Level Up! You are now a ${eligibleLevel.name}!`);
        }
      }
    });
  };
  
  // Synchronize Telegram & Ad Monetization SDK Data
  useEffect(() => {
    // Initialize In-App Interstitial Ads from LibTL SDK
    AdService.initInAppInterstitial();

    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      
      // Load user details dynamically from Telegram
      if (tg.initDataUnsafe?.user) {
        const tgUser = tg.initDataUnsafe.user;
        updateDB((db) => {
          const user = db.users.find(u => u.id === 'usr_willie');
          if (user) {
            user.first_name = tgUser.first_name || 'Willie';
            user.last_name = tgUser.last_name || 'Obi';
            user.username = tgUser.username || 'willie_earn';
            if (tgUser.photo_url) {
              user.avatar = tgUser.photo_url;
            }
          }
        });
        setDbState(loadDB());
      }
    }
  }, []);

  // Theme Sync effect
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('taskcash_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('taskcash_theme', 'light');
    }
  }, [darkMode]);

  // Navigate to Dashboard if onboarding is done
  useEffect(() => {
    if (onboardingCompleted && activeTab === 'Onboarding') {
      setActiveTab('Dashboard');
    }
  }, [onboardingCompleted]);

  // Bottom Safe Area fixes for Telegram Back Button integration
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.BackButton) {
      if (activeTab !== 'Dashboard' && activeTab !== 'Onboarding') {
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
          setActiveTab('Dashboard');
        });
      } else {
        tg.BackButton.hide();
      }
    }
  }, [activeTab]);

  const setTab = (tab: TabName) => {
    setActiveTab(tab);
  };

  const skipOnboarding = () => {
    localStorage.setItem('taskcash_onboarding_done', 'true');
    setOnboardingCompleted(true);
    setActiveTab('Dashboard');
  };

  // Play Rewarded Ad (via LibTL SDK or local simulator fallback)
  const playAd = async (ad: RewardedAd) => {
    if (adPlaying) return;
    
    // Log start of SDK ad play
    AdService.logSdkAction(ad.id, 'AD_PLAY_START', { type: ad.type, time: ad.watch_time_sec });
    
    setActiveAd(ad);
    setAdPlaying(true);
    setAdProgress(0);

    // Check if LibTL ad monetization SDK is loaded & ready
    const hasRealSdk = typeof (window as any).show_11343654 === 'function';

    if (hasRealSdk) {
      setAdProgress(50);
      const sdkFormat = ad.type === 'Popup' ? 'pop' : 'interstitial';
      const sdkSuccess = await AdService.showSdkAd(sdkFormat);

      if (sdkSuccess) {
        setAdProgress(100);
        AdService.logSdkAction(ad.id, 'AD_PLAY_COMPLETE_SUCCESS', { rewarded: true, format: sdkFormat });
        
        updateDB((db) => {
          const user = db.users.find(u => u.id === 'usr_willie');
          if (user) {
            user.total_ads_watched = (user.total_ads_watched || 0) + 1;
          }
        });
        checkAutoLevelUp();
        
        const result = await AdService.validateAndCreditReward('usr_willie', ad);
        
        setActiveAd(null);
        setAdPlaying(false);
        setAdProgress(0);
        setDbState(loadDB());
        
        const tg = (window as any).Telegram?.WebApp;
        if (tg && tg.showAlert) {
          tg.HapticFeedback?.notificationOccurred('success');
          tg.showAlert(result.message);
        } else {
          alert(result.message);
        }
        return;
      }
    }

    // Fallback timer simulation when SDK script is not loaded locally / blocked
    const intervalTime = 100; // tick every 100ms
    const totalTicks = (ad.watch_time_sec * 1000) / intervalTime;
    let ticks = 0;

    const timer = setInterval(async () => {
      ticks++;
      setAdProgress(Math.floor((ticks / totalTicks) * 100));

      if (ticks >= totalTicks) {
        clearInterval(timer);
        
        AdService.logSdkAction(ad.id, 'AD_PLAY_COMPLETE_SUCCESS', { rewarded: true, simulated: true });
        
        updateDB((db) => {
          const user = db.users.find(u => u.id === 'usr_willie');
          if (user) {
            user.total_ads_watched = (user.total_ads_watched || 0) + 1;
          }
        });
        checkAutoLevelUp();

        const result = await AdService.validateAndCreditReward('usr_willie', ad);
        
        setActiveAd(null);
        setAdPlaying(false);
        setAdProgress(0);
        setDbState(loadDB());
        
        const tg = (window as any).Telegram?.WebApp;
        if (tg && tg.showAlert) {
          tg.HapticFeedback?.notificationOccurred('success');
          tg.showAlert(result.message);
        } else {
          alert(result.message);
        }
      }
    }, intervalTime);
  };

  // Play Non-rewarded In-App interstitial
  const triggerInAppAd = (onComplete: () => void) => {
    const inAppAd = dbState.rewarded_ads.find(a => a.type === 'InAppInterstitial') || {
      id: 'ad_inapp_default',
      name: 'Banner Sponsor Ads',
      type: 'InAppInterstitial',
      reward_amount: 0,
      watch_time_sec: 3,
      remaining_views: 999
    } as RewardedAd;

    AdService.logSdkAction(inAppAd.id, 'INAPP_PLAY_START', {});
    setActiveAd(inAppAd);
    setAdPlaying(true);
    setAdProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setAdProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        AdService.logSdkAction(inAppAd.id, 'INAPP_PLAY_COMPLETE', {});
        
        // Add impression log
        updateDB((db) => {
          db.ad_views.unshift({
            id: 'view_inapp_' + Math.random().toString(36).substr(2, 9),
            user_id: 'usr_willie',
            ad_id: inAppAd.id,
            timestamp: new Date().toISOString(),
            rewarded: false
          });
        });

        setActiveAd(null);
        setAdPlaying(false);
        setAdProgress(0);
        setDbState(loadDB());
        onComplete();
      }
    }, 300);
  };

  // Submit Social Task Proof
  const submitTaskProof = async (taskId: string, username: string): Promise<{ success: boolean; message: string }> => {
    const db = loadDB();
    const task = db.tasks.find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Task not found' };

    // Duplicate Check
    const user = db.users.find(u => u.id === 'usr_willie');
    const userLevel = db.levels.find(l => l.id === user?.level_id) || db.levels[0];
    
    // Check if task completed in transaction logs
    const completed = db.transactions.find(
      t => t.type === 'TaskReward' && t.description.includes(task.title) && t.status === 'Success'
    );
    if (completed) {
      return { success: false, message: 'You have already completed this task!' };
    }

    // Daily Limit Check
    const today = new Date().toDateString();
    const todayTasks = db.transactions.filter(
      t => t.type === 'TaskReward' && new Date(t.timestamp).toDateString() === today && t.status === 'Success'
    );
    if (todayTasks.length >= userLevel.max_daily_tasks) {
      return { success: false, message: `Daily task limit reached (${userLevel.max_daily_tasks}/${userLevel.max_daily_tasks} tasks)` };
    }

    // Submit mock proof
    const rewardAmount = Math.round(task.reward_amount * userLevel.earning_multiplier);
    
    // Credit instantly with a notification (in a real DB this would go to a pending task reviews table, but we credit immediately for positive loop)
    addTransaction(
      'usr_willie',
      'TaskReward',
      rewardAmount,
      `Completed Task: ${task.title} (proof username: @${username})`
    );

    updateDB((db) => {
      const u = db.users.find(u => u.id === 'usr_willie');
      if (u) {
        u.total_tasks_completed = (u.total_tasks_completed || 0) + 1;
      }
      db.notifications.unshift({
        id: 'nt_t_' + Math.random().toString(36).substr(2, 9),
        user_id: 'usr_willie',
        title: 'Task Approved',
        message: `Your proof for "${task.title}" has been approved! ₦${rewardAmount.toFixed(2)} credited.`,
        read: false,
        type: 'Task',
        created_at: new Date().toISOString()
      });
    });
    checkAutoLevelUp();

    setDbState(loadDB());
    return { success: true, message: `Task submitted! ₦${rewardAmount.toFixed(2)} added to balance.` };
  };

  // Claim Daily Login Bonus
  const claimDailyBonus = () => {
    const today = new Date().toDateString();
    const lastClaim = dbState.daily_rewards.find(r => r.user_id === 'usr_willie');
    
    if (lastClaim && new Date(lastClaim.claimed_at).toDateString() === today) {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) tg.showAlert('You have already claimed today\'s login reward! Come back tomorrow.');
      else alert('You have already claimed today\'s login reward! Come back tomorrow.');
      return;
    }

    const claimDay = (dbState.daily_rewards.length % 7) + 1;
    const bonusAmount = claimDay * 50; // Daily streak scaling: Day 1 = ₦50, Day 2 = ₦100, etc.

    updateDB((db) => {
      db.daily_rewards.unshift({
        id: 'dr_' + Math.random().toString(36).substr(2, 9),
        user_id: 'usr_willie',
        day_number: claimDay,
        amount: bonusAmount,
        claimed_at: new Date().toISOString()
      });
      const u = db.users.find(user => user.id === 'usr_willie');
      if (u) {
        u.login_streak = (u.login_streak || 0) + 1;
      }
    });
    checkAutoLevelUp();

    // Credit Balance
    addTransaction('usr_willie', 'DailyReward', bonusAmount, `Day ${claimDay} Login Reward Streak`);

    updateDB((db) => {
      db.notifications.unshift({
        id: 'nt_dr_' + Math.random().toString(36).substr(2, 9),
        user_id: 'usr_willie',
        title: 'Daily Bonus Claimed',
        message: `Earned ₦${bonusAmount.toFixed(2)} login streak reward (Day ${claimDay}/7)!`,
        read: false,
        type: 'Wallet',
        created_at: new Date().toISOString()
      });
    });

    setDbState(loadDB());
  };

  const claimWelcomeBonus = () => {
    if (localStorage.getItem('welcome_bonus_claimed')) return;
    localStorage.setItem('welcome_bonus_claimed', 'true');
    addTransaction('usr_willie', 'DailyReward', 500, 'Welcome Bonus');
    setDbState(loadDB());
  };

  const claimCommunityBonus = () => {
    if (localStorage.getItem('community_bonus_claimed')) return;
    localStorage.setItem('community_bonus_claimed', 'true');
    addTransaction('usr_willie', 'TaskReward', 500, 'Telegram Community Bonus');
    setDbState(loadDB());
  };

  const verifyEmail = () => {
    updateDB((db) => {
      const user = db.users.find(u => u.id === 'usr_willie');
      if (user) user.email_verified = true;
    });
    setDbState(loadDB());
  };

  const verifyPhone = () => {
    updateDB((db) => {
      const user = db.users.find(u => u.id === 'usr_willie');
      if (user) user.phone_verified = true;
    });
    setDbState(loadDB());
  };

  const togglePremium = () => {
    updateDB((db) => {
      const user = db.users.find(u => u.id === 'usr_willie');
      if (user) user.is_premium = !user.is_premium;
    });
    setDbState(loadDB());
  };

  // Submit Withdrawal payouts request
  const requestWithdrawal = (
    bankId: string, 
    accountNum: string, 
    accountName: string, 
    amount: number
  ): { success: boolean; message: string } => {
    const db = loadDB();
    const wallet = db.wallets.find(w => w.user_id === 'usr_willie');
    const user = db.users.find(u => u.id === 'usr_willie');
    const userLevel = db.levels.find(l => l.id === user?.level_id) || db.levels[0];
    
    const minWithdraw = userLevel.min_withdrawal;

    if (amount < minWithdraw) {
      return { success: false, message: `Minimum withdrawal amount for ${userLevel.name} is ₦${minWithdraw.toLocaleString()}.` };
    }

    if (!wallet || wallet.active_balance < amount) {
      return { success: false, message: 'Insufficient active balance.' };
    }

    // Submit Request (marked as Pending)
    const requestId = 'wdr_' + Math.random().toString(36).substr(2, 9);
    const newRequest: WithdrawalRequest = {
      id: requestId,
      user_id: 'usr_willie',
      bank_id: bankId,
      account_number: accountNum,
      account_name: accountName,
      amount,
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    // Add transaction and withdrawal request (deduct balance instantly)
    addTransaction('usr_willie', 'Withdrawal', amount, `Withdrawal of ₦${amount.toLocaleString()} to ${accountName} (${accountNum})`, 'Pending');

    updateDB((db) => {
      db.withdrawal_requests.unshift(newRequest);
      db.notifications.unshift({
        id: 'nt_w_' + Math.random().toString(36).substr(2, 9),
        user_id: 'usr_willie',
        title: 'Withdrawal Pending',
        message: `Your cash-out request of ₦${amount.toLocaleString()} is processing. Usually takes 24 hours.`,
        read: false,
        type: 'Wallet',
        created_at: new Date().toISOString()
      });
    });

    setDbState(loadDB());
    return { success: true, message: 'Withdrawal request submitted! Sent to verification queue.' };
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // ADMIN METHODS
  const approveWithdrawal = (id: string) => {
    updateDB((db) => {
      const request = db.withdrawal_requests.find(r => r.id === id);
      if (request) {
        request.status = 'Approved';
        
        // Find matching transaction in logs to set Success
        const tx = db.transactions.find(
          t => t.type === 'Withdrawal' && t.amount === request.amount && t.status === 'Pending'
        );
        if (tx) tx.status = 'Success';

        // Add verification log
        db.activity_logs.unshift({
          id: 'act_' + Math.random().toString(36).substr(2, 9),
          user_id: 'adm_1',
          action: `Approved withdrawal ID: ${id} for ₦${request.amount}`,
          ip: '127.0.0.1',
          user_agent: 'System Admin Panel',
          timestamp: new Date().toISOString()
        });

        db.notifications.unshift({
          id: 'nt_wa_' + Math.random().toString(36).substr(2, 9),
          user_id: request.user_id,
          title: 'Withdrawal Approved',
          message: `Your cash-out of ₦${request.amount.toLocaleString()} has been fully settled by admin!`,
          read: false,
          type: 'Wallet',
          created_at: new Date().toISOString()
        });
      }
    });
    setDbState(loadDB());
  };

  const rejectWithdrawal = (id: string) => {
    updateDB((db) => {
      const request = db.withdrawal_requests.find(r => r.id === id);
      if (request) {
        request.status = 'Rejected';
        
        // Update matching transaction status
        const tx = db.transactions.find(
          t => t.type === 'Withdrawal' && t.amount === request.amount && t.status === 'Pending'
        );
        if (tx) tx.status = 'Failed';

        // Return cash to user wallet
        const wallet = db.wallets.find(w => w.user_id === request.user_id);
        if (wallet) {
          wallet.active_balance += request.amount;
        }

        db.activity_logs.unshift({
          id: 'act_' + Math.random().toString(36).substr(2, 9),
          user_id: 'adm_1',
          action: `Rejected withdrawal ID: ${id}. Returned ₦${request.amount}`,
          ip: '127.0.0.1',
          user_agent: 'System Admin Panel',
          timestamp: new Date().toISOString()
        });

        db.notifications.unshift({
          id: 'nt_wr_' + Math.random().toString(36).substr(2, 9),
          user_id: request.user_id,
          title: 'Withdrawal Rejected',
          message: `Your payout of ₦${request.amount.toLocaleString()} was rejected by system. Funds returned to balance.`,
          read: false,
          type: 'Wallet',
          created_at: new Date().toISOString()
        });
      }
    });
    setDbState(loadDB());
  };

  const banUser = (userId: string) => {
    updateDB((db) => {
      const user = db.users.find(u => u.id === userId);
      if (user) {
        user.status = 'Banned';
        db.activity_logs.unshift({
          id: 'act_' + Math.random().toString(36).substr(2, 9),
          user_id: 'adm_1',
          action: `Banned User ID: ${userId}`,
          ip: '127.0.0.1',
          user_agent: 'System Admin Panel',
          timestamp: new Date().toISOString()
        });
      }
    });
    setDbState(loadDB());
  };

  const unbanUser = (userId: string) => {
    updateDB((db) => {
      const user = db.users.find(u => u.id === userId);
      if (user) {
        user.status = 'Active';
        db.activity_logs.unshift({
          id: 'act_' + Math.random().toString(36).substr(2, 9),
          user_id: 'adm_1',
          action: `Unbanned User ID: ${userId}`,
          ip: '127.0.0.1',
          user_agent: 'System Admin Panel',
          timestamp: new Date().toISOString()
        });
      }
    });
    setDbState(loadDB());
  };

  const resetDatabase = () => {
    localStorage.removeItem('taskcash_mock_db');
    localStorage.removeItem('taskcash_onboarding_done');
    setOnboardingCompleted(false);
    setActiveTab('Onboarding');
    setDbState(loadDB());
  };

  return (
    <AppContext.Provider
      value={{
        user: currentUser,
        wallet: currentWallet,
        transactions: userTransactions,
        levels: dbState.levels,
        tasks: dbState.tasks,
        taskCategories: dbState.task_categories,
        rewardedAds: dbState.rewarded_ads,
        withdrawalRequests: dbState.withdrawal_requests,
        banks: dbState.banks,
        notifications: dbState.notifications.filter(n => n.user_id === 'usr_willie'),
        referrals: dbState.referrals,
        fraudLogs: dbState.fraud_logs,
        postbackLogs: dbState.postback_logs,
        sdkLogs: dbState.sdk_logs,
        
        onboardingCompleted,
        activeTab,
        activeAd,
        adProgress,
        adPlaying,
        darkMode,
        
        setTab,
        skipOnboarding,
        playAd,
        triggerInAppAd,
        submitTaskProof,
        claimDailyBonus,
        claimWelcomeBonus,
        claimCommunityBonus,
        togglePremium,
        verifyEmail,
        verifyPhone,
        requestWithdrawal,
        toggleDarkMode,
        
        // Admin
        approveWithdrawal,
        rejectWithdrawal,
        banUser,
        unbanUser,
        resetDatabase
      }}
    >
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
