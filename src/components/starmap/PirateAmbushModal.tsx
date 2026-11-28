import { useCallback, useState } from 'react';
import { StarMapController } from '@/hooks/useStarMap';
import { useCadenceClicker } from '@/hooks/useCadenceClicker';
import { STARTER_CARGO } from '@/lib/starmap';
import { formatDuration } from '@/lib/game';
import { PirateAmbushContent } from './PirateAmbushContent';

/**
 * Cryptographically-backed random integer in [min, max] (project bans Math.random).
 */
function rollInt(min: number, max: number): number {
  if (max <= min) return min;
  const raw = crypto.getRandomValues(new Uint32Array(1))[0];
  return min + Math.floor((raw / 0xffffffff) * (max - min + 1));
}

export interface PirateAmbushModalProps {
  active: boolean;
  map: StarMapController;
}

export function PirateAmbushModal({ active, map }: PirateAmbushModalProps) {
  const cadence = useCadenceClicker();
  const [outcome, setOutcome] = useState<'ready' | 'evaded' | 'failed'>('ready');
  const [stolen, setStolen] = useState<{ symbol: string; name: string; quantity: number } | null>(
    null
  );
  const gauge = Math.min(100, cadence.comboTier * 5);

  const handleAttemptEvade = useCallback(() => {
    cadence.tap(Date.now());
    const success = rollInt(0, 99) < gauge;
    if (success) {
      setOutcome('evaded');
      map.resolveAmbush(true);
    } else {
      const pick = STARTER_CARGO[rollInt(0, STARTER_CARGO.length - 1)];
      const quantity = Math.max(1, rollInt(0, pick.quantity - 1));
      const stolenCargo = { symbol: pick.symbol, name: pick.name, quantity };
      setStolen(stolenCargo);
      setOutcome('failed');
      map.resolveAmbush(false, stolenCargo);
    }
  }, [cadence, gauge, map]);

  const handleDismiss = useCallback(() => {
    setOutcome('ready');
    setStolen(null);
    cadence.clearDecay();
    map.dismissAmbush();
  }, [cadence, map]);

  const handleContinue = useCallback(() => {
    setOutcome('ready');
    setStolen(null);
    cadence.clearDecay();
  }, [cadence]);

  return (
    <PirateAmbushContent
      active={active}
      outcome={outcome}
      stolen={stolen}
      comboTier={cadence.comboTier}
      secondsPerTap={cadence.secondsPerTap}
      reportTime={formatDuration(45)}
      onAttemptEvade={handleAttemptEvade}
      onTap={() => cadence.tap(Date.now())}
      onContinue={handleContinue}
      onDismiss={handleDismiss}
    />
  );
}