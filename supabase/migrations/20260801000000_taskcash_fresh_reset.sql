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
INSERT INTO public.system_settings (id, key, value)
VALUES 
  ('st_1', 'min_withdrawal_l1', '2000'),
  ('st_2', 'withdrawal_fee_percent', '5'),
  ('st_3', 'maintenance_mode', 'false'),
  ('st_4', 'fraud_detection_level', 'High'),
  ('st_5', 'welcome_bonus_amount', '500'),
  ('st_6', 'telegram_task_reward', '500')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
