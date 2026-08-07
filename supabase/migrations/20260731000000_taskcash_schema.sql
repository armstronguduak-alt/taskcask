-- SwagBucks Supabase Production Database Schema Migration
-- Migration ID: 20260731000000_taskcash_schema
-- Created for SwagBucks Telegram Mini App

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enums
CREATE TYPE user_status_type AS ENUM ('Active', 'Banned');
CREATE TYPE transaction_type_enum AS ENUM ('WatchReward', 'TaskReward', 'ReferralReward', 'DailyReward', 'LevelUpgrade', 'Withdrawal', 'AdViewImpressions');
CREATE TYPE transaction_status_enum AS ENUM ('Success', 'Pending', 'Failed', 'Reversed');
CREATE TYPE withdrawal_status_enum AS ENUM ('Pending', 'Approved', 'Rejected', 'Paid', 'Failed');
CREATE TYPE task_badge_type AS ENUM ('External Link', 'Sponsored', 'Standard');
CREATE TYPE notification_type_enum AS ENUM ('System', 'Wallet', 'Task', 'Referral');
CREATE TYPE severity_level_enum AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE admin_role_enum AS ENUM ('Admin', 'Moderator');
CREATE TYPE wallet_type_enum AS ENUM ('Main', 'Affiliate');
CREATE TYPE currency_type_enum AS ENUM ('SB', 'USDT');

-- 1. Levels Table
CREATE TABLE IF NOT EXISTS public.levels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    earning_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    max_daily_ads_cat_a INTEGER NOT NULL DEFAULT 10,
    max_daily_ads_cat_b INTEGER NOT NULL DEFAULT 5,
    max_daily_ads_cat_c INTEGER NOT NULL DEFAULT 5,
    max_daily_tasks INTEGER NOT NULL DEFAULT 10,
    min_withdrawal_sb NUMERIC(12, 2) NOT NULL DEFAULT 30000.00,
    min_withdrawal_usdt NUMERIC(12, 2) NOT NULL DEFAULT 20.00,
    req_account_age INTEGER NOT NULL DEFAULT 30,
    req_streak INTEGER NOT NULL DEFAULT 20,
    req_ads INTEGER NOT NULL DEFAULT 300,
    req_tasks INTEGER NOT NULL DEFAULT 100,
    req_referrals INTEGER NOT NULL DEFAULT 0,
    benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT ('usr_' || substr(md5(random()::text), 1, 12)),
    telegram_id BIGINT UNIQUE,
    username TEXT,
    first_name TEXT NOT NULL DEFAULT 'Member',
    last_name TEXT,
    avatar TEXT,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    referrer_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    status user_status_type NOT NULL DEFAULT 'Active',
    level_id TEXT NOT NULL REFERENCES public.levels(id) DEFAULT 'lvl_1',
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    login_streak INTEGER NOT NULL DEFAULT 1,
    total_ads_watched INTEGER NOT NULL DEFAULT 0,
    total_tasks_completed INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Wallets Table (Main and Affiliate)
CREATE TABLE IF NOT EXISTS public.wallets (
    id TEXT PRIMARY KEY DEFAULT ('wall_' || substr(md5(random()::text), 1, 12)),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wallet_type wallet_type_enum NOT NULL DEFAULT 'Main',
    balance_sb NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance_sb >= 0),
    balance_usdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance_usdt >= 0),
    lifetime_sb NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (lifetime_sb >= 0),
    lifetime_usdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (lifetime_usdt >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, wallet_type)
);

-- 4. Transactions Ledger Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY DEFAULT ('tx_' || substr(md5(random()::text), 1, 12)),
    wallet_id TEXT NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type transaction_type_enum NOT NULL,
    currency currency_type_enum NOT NULL DEFAULT 'SB',
    amount NUMERIC(12, 2) NOT NULL,
    status transaction_status_enum NOT NULL DEFAULT 'Success',
    description TEXT NOT NULL,
    idempotency_key TEXT UNIQUE,
    provider_tx_id TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Task Categories Table
CREATE TABLE IF NOT EXISTS public.task_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL
);

-- 6. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY DEFAULT ('task_' || substr(md5(random()::text), 1, 12)),
    title TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES public.task_categories(id) ON DELETE CASCADE,
    reward_type currency_type_enum NOT NULL DEFAULT 'SB',
    reward_amount NUMERIC(12, 2) NOT NULL,
    description TEXT NOT NULL,
    link TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    badge task_badge_type DEFAULT 'Standard',
    button_text TEXT DEFAULT 'Do Task',
    icon TEXT DEFAULT 'work',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Task Proofs Table
CREATE TABLE IF NOT EXISTS public.task_proofs (
    id TEXT PRIMARY KEY DEFAULT ('prf_' || substr(md5(random()::text), 1, 12)),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    proof_identifier TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, task_id)
);

-- 8. Rewarded Ads Table
CREATE TABLE IF NOT EXISTS public.rewarded_ads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'None',
    reward_type currency_type_enum NOT NULL DEFAULT 'SB',
    reward_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    watch_time_sec INTEGER NOT NULL DEFAULT 15,
    remaining_views INTEGER NOT NULL DEFAULT 999
);

-- 9. Ad Views Table
CREATE TABLE IF NOT EXISTS public.ad_views (
    id TEXT PRIMARY KEY DEFAULT ('view_' || substr(md5(random()::text), 1, 12)),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ad_id TEXT NOT NULL REFERENCES public.rewarded_ads(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rewarded BOOLEAN NOT NULL DEFAULT TRUE,
    idempotency_key TEXT UNIQUE
);

-- 10. Daily Rewards Table
CREATE TABLE IF NOT EXISTS public.daily_rewards (
    id TEXT PRIMARY KEY DEFAULT ('dr_' || substr(md5(random()::text), 1, 12)),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 7),
    reward_type currency_type_enum NOT NULL DEFAULT 'SB',
    amount NUMERIC(12, 2) NOT NULL,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    claimed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE (user_id, claimed_date)
);

-- 11. Banks Table
CREATE TABLE IF NOT EXISTS public.banks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL
);

-- 12. User Bank Details Table
CREATE TABLE IF NOT EXISTS public.user_bank_details (
    id TEXT PRIMARY KEY DEFAULT ('ubank_' || substr(md5(random()::text), 1, 12)),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bank_id TEXT NOT NULL REFERENCES public.banks(id),
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id TEXT PRIMARY KEY DEFAULT ('wdr_' || substr(md5(random()::text), 1, 12)),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wallet_type wallet_type_enum NOT NULL DEFAULT 'Main',
    currency currency_type_enum NOT NULL DEFAULT 'SB',
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    bank_id TEXT REFERENCES public.banks(id),
    account_number TEXT,
    account_name TEXT,
    trc20_address TEXT,
    status withdrawal_status_enum NOT NULL DEFAULT 'Pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT ('nt_' || substr(md5(random()::text), 1, 12)),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    type notification_type_enum NOT NULL DEFAULT 'System',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
    id TEXT PRIMARY KEY DEFAULT ('ref_' || substr(md5(random()::text), 1, 12)),
    referrer_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    referred_id TEXT NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (referrer_id <> referred_id)
);

-- 16. Referral Earnings Table
CREATE TABLE IF NOT EXISTS public.referral_earnings (
    id TEXT PRIMARY KEY DEFAULT ('refe_' || substr(md5(random()::text), 1, 12)),
    referrer_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    referral_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    currency currency_type_enum NOT NULL DEFAULT 'SB',
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Referral Milestones Table
CREATE TABLE IF NOT EXISTS public.referral_milestones (
    id TEXT PRIMARY KEY,
    required_referrals INTEGER NOT NULL,
    reward_type currency_type_enum NOT NULL DEFAULT 'SB',
    reward_amount NUMERIC(12, 2) NOT NULL,
    title TEXT NOT NULL
);

-- 18. Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY DEFAULT ('ach_' || substr(md5(random()::text), 1, 12)),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY DEFAULT ('log_' || substr(md5(random()::text), 1, 12)),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY DEFAULT ('adm_' || substr(md5(random()::text), 1, 12)),
    username TEXT NOT NULL UNIQUE,
    role admin_role_enum NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id TEXT PRIMARY KEY DEFAULT ('st_' || substr(md5(random()::text), 1, 12)),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. Advertisements Table
CREATE TABLE IF NOT EXISTS public.advertisements (
    id TEXT PRIMARY KEY DEFAULT ('adv_' || substr(md5(random()::text), 1, 12)),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    link TEXT NOT NULL,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. SDK Logs / Postback Logs / Fraud Logs
CREATE TABLE IF NOT EXISTS public.sdk_logs (
    id TEXT PRIMARY KEY DEFAULT ('sdk_' || substr(md5(random()::text), 1, 12)),
    ad_id TEXT NOT NULL,
    action TEXT NOT NULL,
    payload JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.postback_logs (
    id TEXT PRIMARY KEY DEFAULT ('post_' || substr(md5(random()::text), 1, 12)),
    url TEXT NOT NULL,
    status_code INTEGER NOT NULL DEFAULT 200,
    payload JSONB,
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fraud_logs (
    id TEXT PRIMARY KEY DEFAULT ('frd_' || substr(md5(random()::text), 1, 12)),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT NOT NULL,
    severity severity_level_enum NOT NULL DEFAULT 'Medium',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR FAST PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_user_id ON public.ad_views(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id_type ON public.wallets(user_id, wallet_type);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Public tasks read access" ON public.tasks FOR SELECT USING (status = 'Active');
CREATE POLICY "Public categories read access" ON public.task_categories FOR SELECT USING (true);
CREATE POLICY "Public levels read access" ON public.levels FOR SELECT USING (true);
