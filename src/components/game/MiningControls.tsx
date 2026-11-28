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
          'w-full rounded-lg py-2.5 text-sm font-medium shadow-lg shadow-primary/30',
          canMine
            ? 'bg-primary text-primary-foreground active:bg-primary-active'
            : 'cursor-not-allowed border border-primary/50 bg-secondary/30 text-secondary-foreground opacity-50'
        )}
        disabled={!canMine}
        onClick={onMine}
      >
        <Package className="mr-1 h-4 w-4" /> Mine Selected Element
      </button>
      <button
        className="w-full rounded-lg border border-secondary/50 bg-secondary/30 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary-hover/30 active:bg-secondary-active"
        onClick={onRecharge}
      >
        <Zap className="mr-1 h-4 w-4" /> Recharge Energy (+100)
      </button>
    </div>
  );
}
