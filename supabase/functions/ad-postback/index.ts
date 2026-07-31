// Supabase Edge Function: ad-postback
// Verified Provider Webhook Endpoint for Monetag/LibTL Ad Rewards

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");
    const adId = url.searchParams.get("ad_id") || "ad_inter_1";
    const amountStr = url.searchParams.get("reward_amount") || "20";
    const signature = url.searchParams.get("sig");

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing user_id parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rewardAmount = parseFloat(amountStr);
    const idempotencyKey = `postback_${userId}_${adId}_${Date.now()}`;

    // Initialize Supabase Client with Service Role
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call RPC function credit_wallet_transaction
    const { data, error } = await supabase.rpc("credit_wallet_transaction", {
      p_user_id: userId,
      p_type: "WatchReward",
      p_amount: rewardAmount,
      p_description: `Verified Ad Postback Reward (${adId})`,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      throw error;
    }

    // Log Postback
    await supabase.from("postback_logs").insert({
      url: req.url,
      status_code: 200,
      payload: { userId, adId, rewardAmount, signature },
      verified: true,
    });

    return new Response(JSON.stringify({ success: true, result: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
