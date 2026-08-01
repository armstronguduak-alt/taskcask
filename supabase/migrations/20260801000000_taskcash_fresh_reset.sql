-- TaskCash Clean Database Reset Script for Live Production Launch
-- Wipes all test data while preserving table structures, indexes, RLS policies, and RPC functions.

TRUNCATE TABLE 
  public.transactions,
  public.ad_views,
  public.daily_rewards,
  public.withdrawal_requests,
  public.task_proofs,
  public.notifications,
  public.referrals,
  public.referral_earnings,
  public.activity_logs,
  public.fraud_logs,
  public.postback_logs,
  public.sdk_logs,
  public.user_bank_details,
  public.wallets,
  public.users
CASCADE;

-- Re-initialize system settings cleanly if needed
INSERT INTO public.system_settings (id, key, value, description)
VALUES 
  ('st_1', 'min_withdrawal_l1', '2000', 'Minimum withdrawal for Level 1 free user'),
  ('st_2', 'withdrawal_fee_percent', '5', 'Withdrawal fee percentage'),
  ('st_3', 'maintenance_mode', 'false', 'Enable application maintenance mode'),
  ('st_4', 'fraud_detection_level', 'High', 'Fraud detection strictness'),
  ('st_5', 'welcome_bonus_amount', '500', 'Welcome bonus credited on signup'),
  ('st_6', 'telegram_task_reward', '500', 'Telegram community task reward')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
