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
    <div className="mt-3 rounded-lg border border-primary/30 bg-secondary/20 p-3">
      <div className="mb-1 flex items-center justify-between text-[10px]">
        <span className="text-secondary-foreground">Hop Remaining</span>
        <span className="font-mono text-foreground">{formatDuration(hopRemaining)}</span>
      </div>
      <div className="bg-surface h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="h-full bg-gradient-to-r from-primary to-success transition-all duration-1000"
          style={{
            width: `${Math.max(0, ((totalTime - hopRemaining) / totalTime) * 100)}%`,
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          className="flex-1 rounded-lg border border-danger/50 py-2 text-sm font-medium text-danger hover:bg-danger-bg/20 active:bg-danger/30"
          onClick={onCancelHop}
          disabled={hopRemaining <= 0}
        >
          <Cross className="mr-1 h-4 w-4" /> Cancel Hop
          {droppedAt && (
            <span className="ml-1 text-[10px] text-danger">Dropped at {droppedAt}</span>
          )}
        </button>

        <button
          className="flex-1 rounded-lg bg-gradient-to-br from-primary to-primary-active py-2 text-sm font-medium text-primary-foreground shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform active:scale-95"
          onClick={onTimeSkip}
        >
          <Zap className="mr-1 h-4 w-4" />
          Time-Skip
          <span className="ml-2 font-mono text-xs text-success">
            {comboTier <= 0 ? '1x / -1s' : `${comboTier}x / -${secondsPerTap}s`}
          </span>
        </button>
      </div>
    </div>
  );
}
