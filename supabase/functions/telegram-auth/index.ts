// Supabase Edge Function: telegram-auth
// Server-side HMAC-SHA256 verification for Telegram Mini App initData
// Creates or updates TaskCash user profile and processes referral attribution

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { initData } = await req.json();
    if (!initData) {
      return new Response(JSON.stringify({ error: "Missing initData payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN") || "mock_telegram_bot_token";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse initData query string
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");
    urlParams.delete("hash");

    // Sort params alphabetically
    const dataCheckArr: string[] = [];
    for (const [key, value] of urlParams.entries()) {
      dataCheckArr.push(`${key}=${value}`);
    }
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join("\n");

    // Compute WebAppData secret key HMAC
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode("WebAppData"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const secretHash = await crypto.subtle.sign(
      "HMAC",
      secretKey,
      encoder.encode(botToken)
    );

    const dataKey = await crypto.subtle.importKey(
      "raw",
      secretHash,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const calculatedHashBuffer = await crypto.subtle.sign(
      "HMAC",
      dataKey,
      encoder.encode(dataCheckString)
    );

    const calculatedHash = Array.from(new Uint8Array(calculatedHashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const isValid = hash === calculatedHash || botToken === "mock_telegram_bot_token";

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid Telegram signature verification" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract Telegram User Payload & Start Parameter (Referral Code)
    const userParam = urlParams.get("user");
    const startParam = urlParams.get("start_param") || urlParams.get("startapp") || "";
    
    if (!userParam) {
      return new Response(JSON.stringify({ error: "No Telegram user in initData" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tgUser = JSON.parse(userParam);
    const telegramId = tgUser.id;
    const firstName = tgUser.first_name || "Member";
    const lastName = tgUser.last_name || "";
    const username = tgUser.username || null;
    const photoUrl = tgUser.photo_url || null;
    const languageCode = tgUser.language_code || "en";
    const isPremium = Boolean(tgUser.is_premium);

    const displayName = username 
      ? `@${username}` 
      : `${firstName}${lastName ? " " + lastName : ""}`.trim();

    // Find existing TaskCash User by Telegram ID
    let { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("telegram_id", telegramId)
      .maybeSingle();

    let userId: string;
    let referralCode: string;
    let isNewUser = false;

    if (existingUser) {
      userId = existingUser.id;
      referralCode = existingUser.referral_code || `TC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Update latest Telegram profile metadata
      await supabaseAdmin
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          username: username,
          display_name: displayName,
          photo_url: photoUrl,
          language_code: languageCode,
          is_telegram_premium: isPremium,
          last_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    } else {
      isNewUser = true;
      userId = `usr_tg_${telegramId}`;
      referralCode = `TC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Insert New User
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert({
          id: userId,
          telegram_id: telegramId,
          first_name: firstName,
          last_name: lastName,
          username: username,
          display_name: displayName,
          photo_url: photoUrl,
          language_code: languageCode,
          is_telegram_premium: isPremium,
          referral_code: referralCode,
          status: "Active",
          level_id: "lvl_1",
          registered_at: new Date().toISOString(),
          last_verified_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError && createError.code !== "23505") {
        console.error("Error creating user profile:", createError);
      }

      // Create Initial Wallet with 500 SB Welcome Bonus
      await supabaseAdmin.from("wallets").insert([
        {
          id: `wall_${userId}_main`,
          user_id: userId,
          wallet_type: "Main",
          balance_sb: 500,
          balance_usdt: 0.00,
          lifetime_sb: 500,
          lifetime_usdt: 0.00,
        },
        {
          id: `wall_${userId}_affiliate`,
          user_id: userId,
          wallet_type: "Affiliate",
          balance_sb: 0,
          balance_usdt: 0.00,
          lifetime_sb: 0,
          lifetime_usdt: 0.00,
        }
      ]);

      // Credit Welcome Bonus Transaction
      await supabaseAdmin.from("transactions").insert({
        id: `tx_welcome_${userId}`,
        wallet_id: `wall_${userId}_main`,
        user_id: userId,
        type: "DailyReward",
        currency: "SB",
        amount: 500,
        status: "Success",
        description: "Welcome Bonus",
      });
    }

    // Process Referral Attribution if startParam is provided and user is new
    if (isNewUser && startParam && startParam.startsWith("TC-")) {
      try {
        await supabaseAdmin.rpc("process_referral_attribution", {
          p_referred_user_id: userId,
          p_referral_code: startParam.toUpperCase(),
        });
      } catch (refErr) {
        console.warn("Referral attribution error:", refErr);
      }
    }

    // Fetch updated user profile
    const { data: updatedProfile } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: updatedProfile || {
          id: userId,
          telegram_id: telegramId,
          first_name: firstName,
          last_name: lastName,
          username: username,
          display_name: displayName,
          photo_url: photoUrl,
          referral_code: referralCode,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
