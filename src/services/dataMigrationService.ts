import { supabase, isSupabaseConfigured } from './supabaseClient';
import { loadDB } from '../db/mockDb';

export const DataMigrationService = {
  // Sync and migrate local user balance, transactions, and completed activities to Supabase backend
  migrateLocalUserToSupabase: async (): Promise<{ success: boolean; migratedCount: number }> => {
    if (!isSupabaseConfigured()) return { success: false, migratedCount: 0 };

    try {
      const localDb = loadDB();
      let totalMigratedTx = 0;

      console.log('Syncing all users, wallets, and transactions to Supabase backend...');

      // 1. Migrate All Users
      for (const u of localDb.users) {
        await supabase.from('users').upsert({
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name || '',
          username: u.username,
          avatar: u.avatar,
          status: u.status,
          level_id: u.level_id || 'lvl_1',
          is_premium: u.is_premium || false,
          email_verified: u.email_verified || false,
          phone_verified: u.phone_verified || false,
          login_streak: u.login_streak || 1,
          total_ads_watched: u.total_ads_watched || 0,
          total_tasks_completed: u.total_tasks_completed || 0,
        });
      }

      // 2. Migrate All Wallets
      for (const w of localDb.wallets) {
        await supabase.from('wallets').upsert({
          id: w.id,
          user_id: w.user_id,
          active_balance: w.active_balance,
          lifetime_earnings: w.lifetime_earnings,
          pending_balance: w.pending_balance || 0,
        });
      }

      // 3. Migrate All Transactions
      for (const tx of localDb.transactions) {
        const { error } = await supabase.from('transactions').upsert({
          id: tx.id,
          wallet_id: tx.wallet_id,
          user_id: tx.user_id || 'usr_willie',
          type: tx.type,
          amount: tx.amount,
          status: tx.status,
          description: tx.description,
          idempotency_key: `migrated_${tx.id}`,
          timestamp: tx.timestamp
        });
        if (!error) totalMigratedTx++;
      }

      // 4. Migrate All Daily Rewards
      for (const dr of localDb.daily_rewards) {
        await supabase.from('daily_rewards').upsert({
          id: dr.id,
          user_id: dr.user_id,
          day_number: dr.day_number,
          amount: dr.amount,
          claimed_at: dr.claimed_at,
          claimed_date: new Date(dr.claimed_at).toISOString().split('T')[0]
        });
      }

      // 5. Migrate All Withdrawal Requests
      for (const wdr of localDb.withdrawal_requests) {
        await supabase.from('withdrawal_requests').upsert({
          id: wdr.id,
          user_id: wdr.user_id,
          bank_id: wdr.bank_id,
          account_number: wdr.account_number,
          account_name: wdr.account_name,
          amount: wdr.amount,
          status: wdr.status,
          created_at: wdr.created_at
        });
      }

      localStorage.setItem('taskcash_supabase_migrated_v1', 'true');
      console.log(`Supabase Backend Sync Complete! (${totalMigratedTx} transactions active in database)`);
      return { success: true, migratedCount: totalMigratedTx };
    } catch (err) {
      console.error('Data migration error:', err);
      return { success: false, migratedCount: 0 };
    }
  }
};
