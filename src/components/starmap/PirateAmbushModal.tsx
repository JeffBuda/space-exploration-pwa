import { useCallback, useState } from 'react';
import { StarMapController } from '@/hooks/useStarMap';
import { useCadenceClicker } from '@/hooks/useCadenceClicker';
import { STARTER_CARGO } from '@/lib/starmap';
import { formatDuration } from '@/lib/game';
import { PirateAmbushContent } from './PirateAmbushContent';

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
    const success = Math.random() * 100 < gauge;
    if (success) {
      setOutcome('evaded');
      map.resolveAmbush(true);
    } else {
      const pick = STARTER_CARGO[Math.floor(Math.random() * STARTER_CARGO.length)];
      const quantity = Math.max(1, Math.floor(Math.random() * pick.quantity));
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
