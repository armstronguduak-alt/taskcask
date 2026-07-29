export type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

export const triggerHaptic = (style: HapticStyle = 'light') => {
  if (typeof window === 'undefined') return;

  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.HapticFeedback) {
      if (style === 'selection') {
        tg.HapticFeedback.selectionChanged();
      } else if (style === 'success' || style === 'warning' || style === 'error') {
        tg.HapticFeedback.notificationOccurred(style);
      } else {
        tg.HapticFeedback.impactOccurred(style);
      }
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (style === 'light') navigator.vibrate(10);
      else if (style === 'medium') navigator.vibrate(20);
      else if (style === 'heavy') navigator.vibrate(35);
      else if (style === 'selection') navigator.vibrate(8);
      else if (style === 'success') navigator.vibrate([10, 30, 15]);
      else if (style === 'error') navigator.vibrate([30, 50, 30]);
    }
  } catch {
    // Ignore haptic errors on unsupported hardware
  }
};

/**
 * Initializes a delegated global click listener that provides instant haptic feedback
 * on all interactive clickable elements (buttons, links, tabs, cards, inputs) across the app.
 */
export const initGlobalHapticListener = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const handleGlobalClick = (event: MouseEvent | TouchEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Check if clicked target or parent is a clickable element
    const clickable = target.closest(
      'button, a, select, input[type="button"], input[type="submit"], [role="button"], .ripple-active, .cursor-pointer'
    );

    if (clickable) {
      triggerHaptic('light');
    }
  };

  document.addEventListener('click', handleGlobalClick, { capture: true, passive: true });
};
