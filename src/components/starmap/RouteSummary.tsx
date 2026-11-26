import { formatDuration } from '@/lib/game';
import { cn } from '@/lib/utils';

interface RouteSummaryProps {
  route: readonly string[];
  phase: string;
  totalEnergy: number;
  totalTime: number;
  insufficientEnergy: boolean;
  lastMessage: string | null;
}

export function RouteSummary({
  route,
  phase,
  totalEnergy,
  totalTime,
  insufficientEnergy,
  lastMessage,
}: RouteSummaryProps) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-2xl shadow-black/30">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-400">Active Route</span>
        <span className="font-mono text-[10px] text-cyan-400">
          {route.length > 1 ? route.join(' → ') : '—'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-2">
          <p className="mb-1 text-[10px] text-slate-400">Energy Cost</p>
          <span
            className={cn(
              'font-mono text-xs',
              insufficientEnergy ? 'text-red-400' : 'text-cyan-300'
            )}
          >
            {totalEnergy}
          </span>
        </div>
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-2">
          <p className="mb-1 text-[10px] text-slate-400">Travel Time</p>
          <span className="font-mono text-xs text-cyan-300">{formatDuration(totalTime)}</span>
        </div>
      </div>

      {lastMessage && <p className="mt-2 text-[10px] text-cyan-300/60">{lastMessage}</p>}

      {phase === 'idle' && route.length <= 1 && (
        <p className="mt-2 text-center text-[10px] text-slate-500">
          No route plotted. Tap a star to begin.
        </p>
      )}
    </div>
  );
}
