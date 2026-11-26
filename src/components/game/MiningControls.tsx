import { cn } from '@/lib/utils';
import { Package, Zap } from 'lucide-react';
import { calculateWarpEnergyCost } from '@/lib/game';

interface MiningControlsProps {
  selectedSymbol: string | null;
  energy: number;
  onMine: () => void;
  onRecharge: () => void;
}

export function MiningControls({
  selectedSymbol,
  energy,
  onMine,
  onRecharge,
}: MiningControlsProps) {
  const cost = calculateWarpEnergyCost(1);
  const canMine = Boolean(selectedSymbol) && energy >= cost;

  return (
    <div className="mt-3 space-y-2">
      <button
        className={cn(
          'w-full rounded-lg py-2.5 text-sm font-medium shadow-lg shadow-cyan-600/30',
          canMine
            ? 'bg-cyan-600 text-white active:bg-cyan-700'
            : 'cursor-not-allowed border border-cyan-500/50 bg-cyan-900/30 text-cyan-300 opacity-50'
        )}
        disabled={!canMine}
        onClick={onMine}
      >
        <Package className="mr-1 h-4 w-4" /> Mine Selected Element
      </button>
      <button
        className="w-full rounded-lg border border-cyan-700/50 bg-cyan-900/30 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
        onClick={onRecharge}
      >
        <Zap className="mr-1 h-4 w-4" /> Recharge Energy (+100)
      </button>
    </div>
  );
}
