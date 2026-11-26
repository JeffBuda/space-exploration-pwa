import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Cadence-scaling clicker shared by story demos.
 *
 * Initial tap = -1s, scaling exponentially via Math.pow(1.35, comboTier),
 * decaying back to 1s when tapping pauses (> 1s between taps). Combo caps at 20.
 *
 * Extracted from PersistentCommandDrawer.stories.tsx so the clicker logic lives
 * in one place instead of being duplicated across demos.
 */
export function useCadenceClicker() {
  const [comboTier, setComboTier] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const [secondsPerTap, setSecondsPerTap] = useState(1);
  const decayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDecay = useCallback(() => {
    if (decayTimer.current !== null) {
      clearTimeout(decayTimer.current);
      decayTimer.current = null;
    }
  }, []);

  useEffect(() => () => clearDecay(), [clearDecay]);

  const tap = useCallback(
    (now: number) => {
      clearDecay();
      let newCombo: number;
      if (now - lastTap > 1000) {
        newCombo = 0;
      } else {
        newCombo = Math.min(comboTier + 1, 20);
      }
      setComboTier(newCombo);
      setLastTap(now);
      const skip = newCombo <= 0 ? 1 : Math.floor(Math.pow(1.35, newCombo));
      setSecondsPerTap(skip);
      decayTimer.current = setTimeout(() => {
        setComboTier(0);
        setSecondsPerTap(1);
        decayTimer.current = null;
      }, 1000);
      return skip;
    },
    [comboTier, lastTap, clearDecay]
  );

  return { comboTier, lastTap, tap, secondsPerTap, clearDecay };
}
