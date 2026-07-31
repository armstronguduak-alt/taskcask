import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Task, Wallet, Transaction } from '../db/mockDb';

export const SupabaseService = {
  // Fetch Tasks from Supabase database
  getTasks: async (): Promise<Task[] | null> => {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('tasks').select('*').eq('status', 'Active');
    if (error) {
      console.warn('Supabase fetch tasks error:', error);
      return null;
    }
    return data as Task[];
  },

  // Fetch User Wallet from Supabase database
  getWallet: async (userId: string): Promise<Wallet | null> => {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    if (error) {
      console.warn('Supabase fetch wallet error:', error);
      return null;
    }
    return data as Wallet;
  },

  // Fetch Wallet Transactions from Supabase database
  getTransactions: async (userId: string): Promise<Transaction[] | null> => {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
    if (error) {
      console.warn('Supabase fetch transactions error:', error);
      return null;
    }
    return data as Transaction[];
  },

  // Credit Wallet Transaction via RPC Function (Idempotent)
  creditWalletRPC: async (
    userId: string,
    type: string,
    amount: number,
    description: string,
    idempotencyKey?: string
  ): Promise<{ success: boolean; tx_id?: string; message?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase not configured' };
    }

    const { data, error } = await supabase.rpc('credit_wallet_transaction', {
      p_user_id: userId,
      p_type: type,
      p_amount: amount,
      p_description: description,
      p_idempotency_key: idempotencyKey || null,
    });

    if (error) {
      console.error('Supabase creditWalletRPC error:', error);
      return { success: false, message: error.message };
    }
    return data;
  },

  // Create Withdrawal Request via RPC Function
  requestWithdrawalRPC: async (
    userId: string,
    bankId: string,
    accountNumber: string,
    accountName: string,
    amount: number
  ): Promise<{ success: boolean; withdrawal_id?: string; message?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase not configured' };
    }

    const { data, error } = await supabase.rpc('request_withdrawal', {
      p_user_id: userId,
      p_bank_id: bankId,
      p_account_number: accountNumber,
      p_account_name: accountName,
      p_amount: amount,
    });

    if (error) {
      console.error('Supabase requestWithdrawalRPC error:', error);
      return { success: false, message: error.message };
    }
    return data;
  },

  // Submit Task Proof to Supabase
  submitTaskProofDB: async (userId: string, taskId: string, proofUsername: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false;
    const { error } = await supabase.from('task_proofs').insert({
      user_id: userId,
      task_id: taskId,
      proof_identifier: proofUsername,
      status: 'Pending',
    });
    return !error;
  },

  // Telegram Auth via Edge Function
  authenticateTelegram: async (initData: string) => {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.functions.invoke('telegram-auth', {
      body: { initData },
    });
    if (error) {
      console.warn('Telegram Edge Function Auth Error:', error);
      return null;
    }
    return data;
  }
};
