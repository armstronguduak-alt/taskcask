import { supabase, isSupabaseConfigured } from './supabaseClient';
export const getDeterministicReferralCode = (user: any) => {
  return `SB-${user.id.substring(user.id.length - 6).toUpperCase()}`;
};

export interface TelegramAuthResult {
  success: boolean;
  user?: {
    id: string;
    telegram_id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    display_name: string;
    photo_url?: string;
    referral_code: string;
  };
  startParam?: string;
  error?: string;
}

export const TelegramAuthService = {
  // Initialize Telegram WebApp SDK
  initSdk: () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
      } catch (e) {
        console.warn('Telegram SDK ready/expand warning:', e);
      }
    }
  },

  // Get raw initData string
  getInitData: (): string => {
    const tg = (window as any).Telegram?.WebApp;
    return tg?.initData || '';
  },

  // Get start parameter (referral code like TC-XXXXXX)
  getStartParam: (): string => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.start_param) {
      return tg.initDataUnsafe.start_param;
    }
    // Check URL query fallback (?startapp=TC-123456 or ?start=TC-123456 or ?ref=TC-123456)
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('startapp') || urlParams.get('start') || urlParams.get('ref') || '';
  },

  // Perform Server-Side Telegram Auth Verification via Supabase Edge Function
  authenticateTelegramUser: async (): Promise<TelegramAuthResult> => {
    TelegramAuthService.initSdk();

    const initData = TelegramAuthService.getInitData();
    const startParam = TelegramAuthService.getStartParam();

    if (!isSupabaseConfigured()) {
      // Local development mock fallback when Supabase keys are absent
      const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      const mockTelegramId = tgUser?.id || 12345678;
      const mockFirstName = tgUser?.first_name || 'Member';
      const mockUsername = tgUser?.username || 'live_user';
      const mockPhotoUrl = tgUser?.photo_url || null;

      return {
        success: true,
        user: {
          id: `usr_tg_${mockTelegramId}`,
          telegram_id: mockTelegramId,
          first_name: mockFirstName,
          last_name: tgUser?.last_name || '',
          username: mockUsername,
          display_name: mockUsername ? `@${mockUsername}` : mockFirstName,
          photo_url: mockPhotoUrl,
          referral_code: getDeterministicReferralCode({ id: `usr_tg_${mockTelegramId}`, username: mockUsername }),
        },
        startParam,
      };
    }

    try {
      // If running inside Telegram with initData, invoke Edge Function
      if (initData) {
        const { data, error } = await supabase.functions.invoke('telegram-auth', {
          body: { initData },
        });

        if (error || !data?.authenticated) {
          console.warn('Edge function auth error:', error || data?.error);
          return {
            success: false,
            error: data?.error || error?.message || 'Telegram verification failed',
          };
        }

        return {
          success: true,
          user: data.user,
          startParam,
        };
      }

      // Fallback for Web browser preview / dev mode: check existing Supabase session or Telegram user
      const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      const fallbackId = tgUser ? `usr_tg_${tgUser.id}` : 'usr_live_user';
      const fallbackName = tgUser?.first_name || 'Member';
      const fallbackUsername = tgUser?.username || 'live_user';
      const fallbackPhoto = tgUser?.photo_url || null;

      // Upsert profile directly on Supabase
      const referralCode = getDeterministicReferralCode({ id: fallbackId, username: fallbackUsername });
      const { data: userProfile } = await supabase
        .from('users')
        .upsert({
          id: fallbackId,
          telegram_id: tgUser?.id || 12345678,
          first_name: fallbackName,
          last_name: tgUser?.last_name || '',
          username: fallbackUsername,
          display_name: fallbackUsername ? `@${fallbackUsername}` : fallbackName,
          photo_url: fallbackPhoto,
          referral_code: referralCode,
          status: 'Active',
          level_id: 'lvl_1',
          last_verified_at: new Date().toISOString(),
        })
        .select()
        .single();

      return {
        success: true,
        user: userProfile || {
          id: fallbackId,
          telegram_id: 12345678,
          first_name: fallbackName,
          username: fallbackUsername,
          display_name: `@${fallbackUsername}`,
          photo_url: fallbackPhoto,
          referral_code: referralCode,
        },
        startParam,
      };
    } catch (e: any) {
      console.error('Telegram auth exception:', e);
      return {
        success: false,
        error: e.message || 'Authentication error',
      };
    }
  },
};
