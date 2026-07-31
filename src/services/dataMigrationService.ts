import { supabase, isSupabaseConfigured } from './supabaseClient';
import { loadDB } from '../db/mockDb';

export const DataMigrationService = {
  // Sync and migrate local user balance, transactions, and completed activities to Supabase backend
  migrateLocalUserToSupabase: async (): Promise<{ success: boolean; migratedCount: number }> => {
    if (!isSupabaseConfigured()) return { success: false, migratedCount: 0 };
    if (localStorage.getItem('taskcash_supabase_migrated_v1')) {
      return { success: true, migratedCount: 0 }; // Already migrated
    }

    try {
      const localDb = loadDB();
      const localUser = localDb.users.find(u => u.id === 'usr_willie') || localDb.users[0];
      const localWallet = localDb.wallets.find(w => w.user_id === localUser?.id) || localDb.wallets[0];
      const localTransactions = localDb.transactions.filter(t => t.wallet_id === localWallet?.id || t.user_id === localUser?.id);
      const localDailyRewards = localDb.daily_rewards.filter(r => r.user_id === localUser?.id);
      const localWithdrawals = localDb.withdrawal_requests.filter(w => w.user_id === localUser?.id);

      if (!localUser || !localWallet) {
        return { success: false, migratedCount: 0 };
      }

      console.log('Migrating local user activity and earnings to Supabase backend...');

      // 1. Upsert User Profile
      const { error: userError } = await supabase.from('users').upsert({
        id: localUser.id,
        first_name: localUser.first_name,
        last_name: localUser.last_name || '',
        username: localUser.username,
        avatar: localUser.avatar,
        status: localUser.status,
        level_id: localUser.level_id || 'lvl_1',
        is_premium: localUser.is_premium || false,
        email_verified: localUser.email_verified || false,
        phone_verified: localUser.phone_verified || false,
        login_streak: localUser.login_streak || 1,
        total_ads_watched: localUser.total_ads_watched || 0,
        total_tasks_completed: localUser.total_tasks_completed || 0,
      });

      if (userError) {
        console.warn('Migration user upsert error:', userError);
      }

      // 2. Upsert Wallet Balance
      const { error: walletError } = await supabase.from('wallets').upsert({
        id: localWallet.id,
        user_id: localUser.id,
        active_balance: localWallet.active_balance,
        lifetime_earnings: localWallet.lifetime_earnings,
        pending_balance: localWallet.pending_balance || 0,
      });

      if (walletError) {
        console.warn('Migration wallet upsert error:', walletError);
      }

      // 3. Migrate Transactions
      let txCount = 0;
      for (const tx of localTransactions) {
        const { error: txError } = await supabase.from('transactions').upsert({
          id: tx.id,
          wallet_id: localWallet.id,
          user_id: localUser.id,
          type: tx.type,
          amount: tx.amount,
          status: tx.status,
          description: tx.description,
          idempotency_key: `migrated_${tx.id}`,
          timestamp: tx.timestamp
        });
        if (!txError) txCount++;
      }

      // 4. Migrate Daily Rewards
      for (const dr of localDailyRewards) {
        await supabase.from('daily_rewards').upsert({
          id: dr.id,
          user_id: localUser.id,
          day_number: dr.day_number,
          amount: dr.amount,
          claimed_at: dr.claimed_at,
          claimed_date: new Date(dr.claimed_at).toISOString().split('T')[0]
        });
      }

      // 5. Migrate Withdrawal Requests
      for (const wdr of localWithdrawals) {
        await supabase.from('withdrawal_requests').upsert({
          id: wdr.id,
          user_id: localUser.id,
          bank_id: wdr.bank_id,
          account_number: wdr.account_number,
          account_name: wdr.account_name,
          amount: wdr.amount,
          status: wdr.status,
          created_at: wdr.created_at
        });
      }

      localStorage.setItem('taskcash_supabase_migrated_v1', 'true');
      console.log(`Successfully migrated user data to Supabase! (${txCount} transactions synced)`);
      return { success: true, migratedCount: txCount };
    } catch (err) {
      console.error('Data migration error:', err);
      return { success: false, migratedCount: 0 };
    }
  }
};
