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
        <span className="text-[10px] font-medium text-muted-foreground">Active Route</span>
        <span className="font-mono text-[10px] text-primary">
          {route.length > 1 ? route.join(' → ') : '—'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border/50 bg-background/30 p-2">
          <p className="mb-1 text-[10px] text-muted-foreground">Energy Cost</p>
          <span
            className={cn(
              'font-mono text-xs',
              insufficientEnergy ? 'text-danger' : 'text-secondary-foreground'
            )}
          >
            {totalEnergy}
          </span>
        </div>
        <div className="rounded-lg border border-border/50 bg-background/30 p-2">
          <p className="mb-1 text-[10px] text-muted-foreground">Travel Time</p>
          <span className="font-mono text-xs text-secondary-foreground">
            {formatDuration(totalTime)}
          </span>
        </div>
      </div>

      {lastMessage && (
        <p className="mt-2 text-[10px] text-secondary-foreground/60">{lastMessage}</p>
      )}

      {phase === 'idle' && route.length <= 1 && (
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          No route plotted. Tap a star to begin.
        </p>
      )}
    </div>
  );
}
