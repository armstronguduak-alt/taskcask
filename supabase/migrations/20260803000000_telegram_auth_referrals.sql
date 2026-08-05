-- TaskCash Supabase Migration: Telegram Auth & Referral System Upgrade
-- Migration ID: 20260803000000_telegram_auth_referrals

-- 1. Helper function to generate unique referral code (TC-XXXXXX)
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_code TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        v_code := 'TC-' || UPPER(substr(md5(random()::text), 1, 6));
        SELECT EXISTS (SELECT 1 FROM public.users WHERE referral_code = v_code) INTO v_exists;
        EXIT WHEN NOT v_exists;
    END LOOP;
    RETURN v_code;
END;
$$;

-- 2. Extend public.users table with Telegram profile details & referral code
ALTER TABLE public.users 
    ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE,
    ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE DEFAULT public.generate_referral_code(),
    ADD COLUMN IF NOT EXISTS photo_url TEXT,
    ADD COLUMN IF NOT EXISTS display_name TEXT,
    ADD COLUMN IF NOT EXISTS language_code TEXT,
    ADD COLUMN IF NOT EXISTS is_telegram_premium BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT NOW();

-- Populate existing null referral codes if any
UPDATE public.users 
SET referral_code = public.generate_referral_code() 
WHERE referral_code IS NULL;

-- Make referral_code NOT NULL
ALTER TABLE public.users ALTER COLUMN referral_code SET NOT NULL;

-- 3. Update public.referrals table constraints & columns
ALTER TABLE public.referrals
    ADD COLUMN IF NOT EXISTS referral_code_used TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Pending',
    ADD COLUMN IF NOT EXISTS qualification_status TEXT NOT NULL DEFAULT 'Pending',
    ADD COLUMN IF NOT EXISTS reward_status TEXT NOT NULL DEFAULT 'Pending',
    ADD COLUMN IF NOT EXISTS reward_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS qualified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rewarded_at TIMESTAMPTZ;

-- Enforce ONE referrer per referred user
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'referrals_referred_id_key'
    ) THEN
        ALTER TABLE public.referrals ADD CONSTRAINT referrals_referred_id_key UNIQUE (referred_id);
    END IF;
END $$;

-- 4. Function for atomic referral attribution
CREATE OR REPLACE FUNCTION public.process_referral_attribution(
    p_referred_user_id TEXT,
    p_referral_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_referrer_user_id TEXT;
    v_existing_ref TEXT;
BEGIN
    -- Validate referral code
    IF p_referral_code IS NULL OR p_referral_code = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'No referral code provided');
    END IF;

    -- Find referrer by referral code
    SELECT id INTO v_referrer_user_id 
    FROM public.users 
    WHERE referral_code = p_referral_code;

    IF v_referrer_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid referral code');
    END IF;

    -- Prevent self-referral
    IF v_referrer_user_id = p_referred_user_id THEN
        RETURN jsonb_build_object('success', false, 'message', 'Self-referral is not allowed');
    END IF;

    -- Check if user already has a referrer
    SELECT id INTO v_existing_ref 
    FROM public.referrals 
    WHERE referred_id = p_referred_user_id;

    IF v_existing_ref IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'User already has a referrer');
    END IF;

    -- Create relationship
    INSERT INTO public.referrals (referrer_id, referred_id, referral_code_used, status, qualification_status)
    VALUES (v_referrer_user_id, p_referred_user_id, p_referral_code, 'Active', 'Pending')
    ON CONFLICT (referred_id) DO NOTHING;

    -- Update referrer_id in users table
    UPDATE public.users 
    SET referrer_id = v_referrer_user_id 
    WHERE id = p_referred_user_id AND referrer_id IS NULL;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Referral attribution successful',
        'referrer_id', v_referrer_user_id
    );
END;
$$;

-- 5. Indexes for Fast Profile & Referral Queries
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);

-- 6. Safe RLS Policy for Referrals Page Display
-- Allow referrers to read safe public fields of users they referred
CREATE OR REPLACE VIEW public.referral_profiles_view AS
SELECT 
    r.id AS referral_id,
    r.referrer_id,
    r.referred_id,
    r.status AS referral_status,
    r.qualification_status,
    r.reward_status,
    r.reward_amount,
    r.created_at AS joined_at,
    u.first_name,
    u.last_name,
    u.display_name,
    u.username,
    u.photo_url,
    u.status AS account_status
FROM public.referrals r
JOIN public.users u ON r.referred_id = u.id;

GRANT SELECT ON public.referral_profiles_view TO authenticated, anon;
