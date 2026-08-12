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

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.users;
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid()::text = id);

-- Allow public read access to static data
DROP POLICY IF EXISTS "Public tasks viewable" ON public.tasks;
CREATE POLICY "Public tasks viewable" ON public.tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public categories viewable" ON public.task_categories;
CREATE POLICY "Public categories viewable" ON public.task_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public ads viewable" ON public.rewarded_ads;
CREATE POLICY "Public ads viewable" ON public.rewarded_ads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public banks viewable" ON public.banks;
CREATE POLICY "Public banks viewable" ON public.banks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public levels viewable" ON public.levels;
CREATE POLICY "Public levels viewable" ON public.levels FOR SELECT USING (true);

-- Allow users to view their own wallets and transactions
DROP POLICY IF EXISTS "Users can view own wallets" ON public.wallets;
CREATE POLICY "Users can view own wallets" ON public.wallets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (true);

-- Realtime Configuration
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 13. RPC Functions for Balance Updates
CREATE OR REPLACE FUNCTION credit_wallet_transaction(
    p_user_id TEXT,
    p_type TEXT,
    p_amount DECIMAL,
    p_description TEXT,
    p_idempotency_key TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_wallet_id TEXT;
    v_currency TEXT;
BEGIN
    -- Determine currency based on type or amount (Assuming USDT if fractional, else SB)
    IF p_amount < 100 THEN
        v_currency := 'USDT';
    ELSE
        v_currency := 'SB';
    END IF;

    -- Get Main Wallet
    SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = p_user_id AND wallet_type = 'Main' LIMIT 1;
    
    IF v_wallet_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Wallet not found');
    END IF;

    -- Update Wallet
    IF v_currency = 'SB' THEN
        UPDATE public.wallets SET balance_sb = balance_sb + p_amount, lifetime_sb = lifetime_sb + p_amount WHERE id = v_wallet_id;
    ELSE
        UPDATE public.wallets SET balance_usdt = balance_usdt + p_amount, lifetime_usdt = lifetime_usdt + p_amount WHERE id = v_wallet_id;
    END IF;

    -- Insert Transaction
    INSERT INTO public.transactions (wallet_id, user_id, type, currency, amount, status, description)
    VALUES (v_wallet_id, p_user_id, p_type, v_currency, p_amount, 'Success', p_description);

    RETURN jsonb_build_object('success', true, 'message', 'Credited successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION request_withdrawal(
    p_user_id TEXT,
    p_bank_id TEXT,
    p_account_number TEXT,
    p_account_name TEXT,
    p_amount DECIMAL
) RETURNS JSONB AS $$
DECLARE
    v_wallet_id TEXT;
    v_balance DECIMAL;
    v_currency TEXT;
BEGIN
    IF p_amount > 1000 THEN
        v_currency := 'SB';
    ELSE
        v_currency := 'USDT';
    END IF;

    SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = p_user_id AND wallet_type = 'Main' LIMIT 1;
    
    IF v_currency = 'SB' THEN
        SELECT balance_sb INTO v_balance FROM public.wallets WHERE id = v_wallet_id;
    ELSE
        SELECT balance_usdt INTO v_balance FROM public.wallets WHERE id = v_wallet_id;
    END IF;

    IF v_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance');
    END IF;

    -- Deduct balance
    IF v_currency = 'SB' THEN
        UPDATE public.wallets SET balance_sb = balance_sb - p_amount WHERE id = v_wallet_id;
    ELSE
        UPDATE public.wallets SET balance_usdt = balance_usdt - p_amount WHERE id = v_wallet_id;
    END IF;

    -- Insert Withdrawal Request
    INSERT INTO public.withdrawal_requests (user_id, wallet_type, currency, bank_id, account_number, account_name, amount)
    VALUES (p_user_id, 'Main', v_currency, p_bank_id, p_account_number, p_account_name, p_amount);

    -- Insert Transaction
    INSERT INTO public.transactions (wallet_id, user_id, type, currency, amount, status, description)
    VALUES (v_wallet_id, p_user_id, 'Withdrawal', v_currency, -p_amount, 'Pending', 'Withdrawal Request');

    RETURN jsonb_build_object('success', true, 'message', 'Withdrawal requested successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
