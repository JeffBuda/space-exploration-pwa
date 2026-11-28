import { AmbushEvasionPanel } from './AmbushEvasionPanel';
import { AmbushStolen } from './AmbushStolen';
import { AmbushReport } from './AmbushReport';
import { AmbushModalHeader } from './AmbushModalHeader';
import { AmbushOutcomeActions } from './AmbushOutcomeActions';

interface PirateAmbushContentProps {
  active: boolean;
  outcome: 'ready' | 'evaded' | 'failed';
  stolen: { symbol: string; name: string; quantity: number } | null;
  comboTier: number;
  secondsPerTap: number;
  reportTime: string;
  onAttemptEvade: () => void;
  onTap: () => void;
  onContinue: () => void;
  onDismiss: () => void;
}

export function PirateAmbushContent({
  active,
  outcome,
  stolen,
  comboTier,
  secondsPerTap,
  reportTime,
  onAttemptEvade,
  onTap,
  onContinue,
  onDismiss,
}: PirateAmbushContentProps) {
  const shouldRender = active && outcome !== null;

  if (!shouldRender) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      style={{ touchAction: 'none' }}
    >
      <div
        className="w-full max-w-md space-y-2 rounded-2xl bg-[hsl(var(--card))] p-6 shadow-2xl shadow-black/30"
        style={{ touchAction: 'pan-y' }}
      >
        <AmbushModalHeader onDismiss={onDismiss} />

        <AmbushReport reportTime={reportTime} />

        {outcome === 'failed' && <AmbushStolen stolen={stolen} />}
        {outcome === 'evaded' && <AmbushStolen evaded />}

        {outcome === 'ready' && (
          <AmbushEvasionPanel
            comboTier={comboTier}
            secondsPerTap={secondsPerTap}
            onAttemptEvade={onAttemptEvade}
            onTap={onTap}
          />
        )}

        <AmbushOutcomeActions outcome={outcome} onContinue={onContinue} onDismiss={onDismiss} />
      </div>
    </div>
  );
}
