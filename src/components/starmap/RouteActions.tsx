import { cn } from '@/lib/utils';
import { Command, Cross } from 'lucide-react';

interface RouteActionsProps {
  routeLength: number;
  phase: string;
  isAmbushActive: boolean;
  insufficientEnergy: boolean;
  onEngage: () => void;
  onClearRoute: () => void;
}

export function RouteActions({
  routeLength,
  phase,
  isAmbushActive,
  insufficientEnergy,
  onEngage,
  onClearRoute,
}: RouteActionsProps) {
  if (phase !== 'idle' || isAmbushActive || routeLength <= 1) return null;

  return (
    <div className="mt-3">
      <button
        className={cn(
          'flex w-full items-center justify-center gap-1 rounded-lg py-2.5 text-sm font-medium shadow-lg shadow-primary/30',
          insufficientEnergy
            ? 'cursor-not-allowed border border-primary/50 bg-secondary/30 text-secondary-foreground opacity-50'
            : 'bg-primary text-primary-foreground active:bg-primary-active'
        )}
        disabled={insufficientEnergy}
        onClick={onEngage}
      >
        <Command className="h-4 w-4" />
        Engage Warp
        {insufficientEnergy && (
          <span className="ml-1 text-[10px] text-danger">Insufficient Energy</span>
        )}
      </button>
      <button
        className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-secondary/50 bg-secondary/30 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary-hover/30 active:bg-secondary-active"
        onClick={onClearRoute}
      >
        <Cross className="h-4 w-4" /> Clear Route
      </button>
    </div>
  );
}
