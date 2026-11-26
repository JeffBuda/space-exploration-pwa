import { Zap } from 'lucide-react';
import { EvasionGauge } from './EvasionGauge';

interface AmbushEvasionPanelProps {
  comboTier: number;
  secondsPerTap: number;
  onAttemptEvade: () => void;
  onTap: () => void;
}

export function AmbushEvasionPanel({
  comboTier,
  secondsPerTap,
  onAttemptEvade,
  onTap,
}: AmbushEvasionPanelProps) {
  return (
    <div className="mb-4 rounded-lg border border-cyan-700/30 bg-cyan-900/20 p-3">
      <p className="mb-2 text-[10px] font-medium text-cyan-300">Cadence-Scaling Evasion</p>
      <p className="mb-2 text-[10px] text-cyan-200/60">
        Tapping faster increases evasion probability. Failing to evade loses cargo.
      </p>

      <EvasionGauge comboTier={comboTier} />

      <div className="flex items-center justify-between gap-2">
        <button
          className="flex-1 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-800 py-2 text-sm font-medium text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform active:scale-95"
          onClick={onTap}
        >
          <Zap className="mr-1 h-4 w-4" />
          Tap to Build Speed
        </button>
        <button
          className="flex-1 rounded-lg border border-cyan-700/50 bg-cyan-900/30 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
          onClick={onAttemptEvade}
        >
          Attempt Evasion
        </button>
      </div>
      <p className="mt-2 text-[10px] text-cyan-200/60">
        Combo Tier: {comboTier} · Seconds per tap: {secondsPerTap}s
      </p>
    </div>
  );
}
