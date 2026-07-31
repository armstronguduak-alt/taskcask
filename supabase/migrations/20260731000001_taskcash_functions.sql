-- TaskCash PostgreSQL RPC Functions Migration
-- Migration ID: 20260731000001_taskcash_functions

-- 1. Atomic Idempotent Wallet Credit Function
CREATE OR REPLACE FUNCTION public.credit_wallet_transaction(
    p_user_id TEXT,
    p_type transaction_type_enum,
    p_amount NUMERIC(12, 2),
    p_description TEXT,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_id TEXT;
    v_tx_id TEXT;
    v_new_active NUMERIC(12, 2);
    v_existing_tx_id TEXT;
BEGIN
    -- Idempotency Check
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id INTO v_existing_tx_id 
        FROM public.transactions 
        WHERE idempotency_key = p_idempotency_key;

        IF v_existing_tx_id IS NOT NULL THEN
            RETURN jsonb_build_object(
                'success', true,
                'message', 'Transaction already processed (idempotent)',
                'tx_id', v_existing_tx_id
            );
        END IF;
    END IF;

    -- Retrieve or Create Wallet
    SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = p_user_id;
    IF v_wallet_id IS NULL THEN
        INSERT INTO public.wallets (user_id, active_balance, lifetime_earnings)
        VALUES (p_user_id, 0.00, 0.00)
        RETURNING id INTO v_wallet_id;
    END IF;

    -- Generate Transaction ID
    v_tx_id := 'tx_' || substr(md5(random()::text), 1, 12);

    -- Insert Transaction Record
    INSERT INTO public.transactions (id, wallet_id, user_id, type, amount, status, description, idempotency_key)
    VALUES (v_tx_id, v_wallet_id, p_user_id, p_type, p_amount, 'Success', p_description, p_idempotency_key);

    -- Update Wallet Balances Atomically
    IF p_amount > 0 THEN
        UPDATE public.wallets 
        SET active_balance = active_balance + p_amount,
            lifetime_earnings = lifetime_earnings + p_amount,
            updated_at = NOW()
        WHERE id = v_wallet_id
        RETURNING active_balance INTO v_new_active;
    ELSE
        UPDATE public.wallets 
        SET active_balance = active_balance + p_amount,
            updated_at = NOW()
        WHERE id = v_wallet_id
        RETURNING active_balance INTO v_new_active;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Wallet transaction credited successfully',
        'tx_id', v_tx_id,
        'new_active_balance', v_new_active
    );
END;
$$;

-- 2. Withdrawal Request & Balance Reservation Function
CREATE OR REPLACE FUNCTION public.request_withdrawal(
    p_user_id TEXT,
    p_bank_id TEXT,
    p_account_number TEXT,
    p_account_name TEXT,
    p_amount NUMERIC(12, 2)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_id TEXT;
    v_active_balance NUMERIC(12, 2);
    v_wdr_id TEXT;
    v_tx_id TEXT;
BEGIN
    -- Check User Wallet
    SELECT id, active_balance INTO v_wallet_id, v_active_balance 
    FROM public.wallets 
    WHERE user_id = p_user_id FOR UPDATE;

    IF v_wallet_id IS NULL OR v_active_balance < p_amount THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Insufficient withdrawable balance'
        );
    END IF;

    -- Reserve Balance: Debit active_balance, credit pending_balance
    UPDATE public.wallets 
    SET active_balance = active_balance - p_amount,
        pending_balance = pending_balance + p_amount,
        updated_at = NOW()
    WHERE id = v_wallet_id;

    -- Insert Withdrawal Request
    v_wdr_id := 'wdr_' || substr(md5(random()::text), 1, 12);
    INSERT INTO public.withdrawal_requests (id, user_id, bank_id, account_number, account_name, amount, status)
    VALUES (v_wdr_id, p_user_id, p_bank_id, p_account_number, p_account_name, p_amount, 'Pending');

    -- Insert Transaction Record (Pending)
    v_tx_id := 'tx_' || substr(md5(random()::text), 1, 12);
    INSERT INTO public.transactions (id, wallet_id, user_id, type, amount, status, description)
    VALUES (v_tx_id, v_wallet_id, p_user_id, 'Withdrawal', -p_amount, 'Pending', 'Withdrawal Request to ' || p_account_name || ' (' || p_account_number || ')');

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Withdrawal request created successfully and balance reserved',
        'withdrawal_id', v_wdr_id,
        'tx_id', v_tx_id
    );
END;
$$;

-- 3. Process Admin Withdrawal Decision (Approval / Reversal)
CREATE OR REPLACE FUNCTION public.process_withdrawal_admin(
    p_withdrawal_id TEXT,
    p_status withdrawal_status_enum,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id TEXT;
    v_amount NUMERIC(12, 2);
    v_wallet_id TEXT;
    v_current_status withdrawal_status_enum;
BEGIN
    SELECT user_id, amount, status INTO v_user_id, v_amount, v_current_status 
    FROM public.withdrawal_requests 
    WHERE id = p_withdrawal_id FOR UPDATE;

    IF v_current_status <> 'Pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Withdrawal already processed');
    END IF;

    SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = v_user_id FOR UPDATE;

    IF p_status = 'Approved' OR p_status = 'Paid' THEN
        -- Settle: deduct from pending_balance
        UPDATE public.wallets 
        SET pending_balance = pending_balance - v_amount,
            updated_at = NOW()
        WHERE id = v_wallet_id;

        UPDATE public.withdrawal_requests 
        SET status = 'Paid', admin_notes = p_admin_notes, updated_at = NOW()
        WHERE id = p_withdrawal_id;

    ELSIF p_status = 'Rejected' THEN
        -- Reversal: refund pending_balance back to active_balance
        UPDATE public.wallets 
        SET pending_balance = pending_balance - v_amount,
            active_balance = active_balance + v_amount,
            updated_at = NOW()
        WHERE id = v_wallet_id;

        UPDATE public.withdrawal_requests 
        SET status = 'Rejected', admin_notes = p_admin_notes, updated_at = NOW()
        WHERE id = p_withdrawal_id;

        -- Create Reversal Transaction
        INSERT INTO public.transactions (wallet_id, user_id, type, amount, status, description)
        VALUES (v_wallet_id, v_user_id, 'Withdrawal', v_amount, 'Reversed', 'Refunded rejected withdrawal #' || p_withdrawal_id);
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Withdrawal decision processed');
END;
$$;
