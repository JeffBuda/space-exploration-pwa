import { formatDuration } from '@/lib/game';
import { Cross, Zap } from 'lucide-react';

interface TransitControlsProps {
  totalTime: number;
  hopRemaining: number;
  droppedAt: string | null;
  comboTier: number;
  secondsPerTap: number;
  onCancelHop: () => void;
  onTimeSkip: () => void;
}

export function TransitControls({
  totalTime,
  hopRemaining,
  droppedAt,
  comboTier,
  secondsPerTap,
  onCancelHop,
  onTimeSkip,
}: TransitControlsProps) {
  return (
    <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-900/20 p-3">
      <div className="mb-1 flex items-center justify-between text-[10px]">
        <span className="text-cyan-300">Hop Remaining</span>
        <span className="font-mono text-cyan-100">{formatDuration(hopRemaining)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-green-400 transition-all duration-1000"
          style={{
            width: `${Math.max(0, ((totalTime - hopRemaining) / totalTime) * 100)}%`,
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          className="flex-1 rounded-lg border border-red-500/50 py-2 text-sm font-medium text-red-400 hover:bg-red-900/20 active:bg-red-800/30"
          onClick={onCancelHop}
          disabled={hopRemaining <= 0}
        >
          <Cross className="mr-1 h-4 w-4" /> Cancel Hop
          {droppedAt && (
            <span className="ml-1 text-[10px] text-red-400">Dropped at {droppedAt}</span>
          )}
        </button>

        <button
          className="flex-1 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-800 py-2 text-sm font-medium text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform active:scale-95"
          onClick={onTimeSkip}
        >
          <Zap className="mr-1 h-4 w-4" />
          Time-Skip
          <span className="ml-2 font-mono text-xs text-green-300">
            {comboTier <= 0 ? '1x / -1s' : `${comboTier}x / -${secondsPerTap}s`}
          </span>
        </button>
      </div>
    </div>
  );
}
