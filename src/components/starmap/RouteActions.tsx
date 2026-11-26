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
          'flex w-full items-center justify-center gap-1 rounded-lg py-2.5 text-sm font-medium shadow-lg shadow-cyan-600/30',
          insufficientEnergy
            ? 'cursor-not-allowed border border-cyan-500/50 bg-cyan-900/30 text-cyan-300 opacity-50'
            : 'bg-cyan-600 text-white active:bg-cyan-700'
        )}
        disabled={insufficientEnergy}
        onClick={onEngage}
      >
        <Command className="h-4 w-4" />
        Engage Warp
        {insufficientEnergy && (
          <span className="ml-1 text-[10px] text-red-400">Insufficient Energy</span>
        )}
      </button>
      <button
        className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-cyan-700/50 bg-cyan-900/30 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
        onClick={onClearRoute}
      >
        <Cross className="h-4 w-4" /> Clear Route
      </button>
    </div>
  );
}
