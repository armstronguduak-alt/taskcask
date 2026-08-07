-- SwagBucks PostgreSQL RPC Functions Migration
-- Migration ID: 20260731000001_taskcash_functions

-- 1. Atomic Idempotent Wallet Credit Function
CREATE OR REPLACE FUNCTION public.credit_wallet_transaction(
    p_user_id TEXT,
    p_wallet_type wallet_type_enum,
    p_currency currency_type_enum,
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
    SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = p_user_id AND wallet_type = p_wallet_type;
    IF v_wallet_id IS NULL THEN
        INSERT INTO public.wallets (user_id, wallet_type)
        VALUES (p_user_id, p_wallet_type)
        RETURNING id INTO v_wallet_id;
    END IF;

    -- Generate Transaction ID
    v_tx_id := 'tx_' || substr(md5(random()::text), 1, 12);

    -- Insert Transaction Record
    INSERT INTO public.transactions (id, wallet_id, user_id, type, currency, amount, status, description, idempotency_key)
    VALUES (v_tx_id, v_wallet_id, p_user_id, p_type, p_currency, p_amount, 'Success', p_description, p_idempotency_key);

    -- Update Wallet Balances Atomically
    IF p_currency = 'SB' THEN
        IF p_amount > 0 THEN
            UPDATE public.wallets 
            SET balance_sb = balance_sb + p_amount,
                lifetime_sb = lifetime_sb + p_amount,
                updated_at = NOW()
            WHERE id = v_wallet_id;
        ELSE
            UPDATE public.wallets 
            SET balance_sb = balance_sb + p_amount,
                updated_at = NOW()
            WHERE id = v_wallet_id;
        END IF;
    ELSIF p_currency = 'USDT' THEN
        IF p_amount > 0 THEN
            UPDATE public.wallets 
            SET balance_usdt = balance_usdt + p_amount,
                lifetime_usdt = lifetime_usdt + p_amount,
                updated_at = NOW()
            WHERE id = v_wallet_id;
        ELSE
            UPDATE public.wallets 
            SET balance_usdt = balance_usdt + p_amount,
                updated_at = NOW()
            WHERE id = v_wallet_id;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Wallet transaction credited successfully',
        'tx_id', v_tx_id
    );
END;
$$;
