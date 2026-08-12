-- TaskCash Supabase Schema Initialization

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Levels Table
CREATE TABLE IF NOT EXISTS public.levels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cost INTEGER NOT NULL DEFAULT 0,
    earning_multiplier DECIMAL NOT NULL DEFAULT 1.0,
    max_daily_ads_cat_a INTEGER NOT NULL DEFAULT 10,
    max_daily_ads_cat_b INTEGER NOT NULL DEFAULT 10,
    max_daily_ads_cat_c INTEGER NOT NULL DEFAULT 10,
    max_daily_tasks INTEGER NOT NULL DEFAULT 10,
    min_withdrawal_sb INTEGER NOT NULL DEFAULT 30000,
    min_withdrawal_usdt DECIMAL NOT NULL DEFAULT 20.0,
    req_account_age INTEGER NOT NULL DEFAULT 0,
    req_streak INTEGER NOT NULL DEFAULT 0,
    req_ads INTEGER NOT NULL DEFAULT 0,
    req_tasks INTEGER NOT NULL DEFAULT 0,
    req_referrals INTEGER NOT NULL DEFAULT 0,
    benefits JSONB
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    telegram_id BIGINT UNIQUE,
    username TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    display_name TEXT,
    photo_url TEXT,
    avatar TEXT,
    referral_code TEXT UNIQUE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    referrer_id TEXT REFERENCES public.users(id),
    status TEXT DEFAULT 'Active',
    level_id TEXT REFERENCES public.levels(id),
    is_premium BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    login_streak INTEGER DEFAULT 0,
    total_ads_watched INTEGER DEFAULT 0,
    total_tasks_completed INTEGER DEFAULT 0
);

-- 3. Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    wallet_type TEXT NOT NULL CHECK (wallet_type IN ('Main', 'Affiliate')),
    balance_sb INTEGER DEFAULT 0,
    balance_usdt DECIMAL DEFAULT 0,
    lifetime_sb INTEGER DEFAULT 0,
    lifetime_usdt DECIMAL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    wallet_id TEXT REFERENCES public.wallets(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('SB', 'USDT')),
    amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'Success',
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Task Categories
CREATE TABLE IF NOT EXISTS public.task_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT
);

-- 6. Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category_id TEXT REFERENCES public.task_categories(id),
    reward_type TEXT NOT NULL CHECK (reward_type IN ('SB', 'USDT')),
    reward_amount DECIMAL NOT NULL,
    description TEXT,
    link TEXT,
    status TEXT DEFAULT 'Active',
    badge TEXT,
    button_text TEXT,
    icon TEXT,
    requires_screenshot BOOLEAN DEFAULT FALSE
);

-- 7. Task Proofs
CREATE TABLE IF NOT EXISTS public.task_proofs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    task_id TEXT REFERENCES public.tasks(id) ON DELETE CASCADE,
    proof_identifier TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Rewarded Ads
CREATE TABLE IF NOT EXISTS public.rewarded_ads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('SB', 'USDT')),
    reward_amount DECIMAL NOT NULL,
    watch_time_sec INTEGER DEFAULT 15,
    remaining_views INTEGER DEFAULT 1
);

-- 9. Banks
CREATE TABLE IF NOT EXISTS public.banks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT
);

-- 10. Withdrawal Requests
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    wallet_type TEXT NOT NULL CHECK (wallet_type IN ('Main', 'Affiliate')),
    currency TEXT NOT NULL CHECK (currency IN ('SB', 'USDT')),
    bank_id TEXT REFERENCES public.banks(id),
    account_number TEXT,
    account_name TEXT,
    trc20_address TEXT,
    amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Referrals
CREATE TABLE IF NOT EXISTS public.referrals (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    referrer_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    referred_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    referral_status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referred_id)
);

-- Enable RLS and Realtime (Placeholder policies for now)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid()::text = id);

-- Realtime Configuration
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
