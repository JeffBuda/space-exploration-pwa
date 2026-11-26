import { cn } from '@/lib/utils';
import { ELEMENTS } from '@/lib/elements';
import { RARITY_COLORS, RARITY_BG } from '@/lib/game';

interface CargoHoldListProps {
  cargoHold: { symbol: string; quantity: number }[];
}

export function CargoHoldList({ cargoHold }: CargoHoldListProps) {
  if (cargoHold.length === 0) {
    return <p className="py-2 text-center text-xs text-slate-500">Empty hold</p>;
  }
  return (
    <div className="max-h-[40vh] space-y-1 overflow-y-auto">
      {cargoHold.map((slot) => {
        const element = ELEMENTS.find((e) => e.symbol === slot.symbol);
        if (!element) return null;
        return (
          <div
            key={element.symbol}
            className={cn(
              'flex items-center justify-between rounded-lg border p-2',
              'border-slate-600/50 bg-slate-900/20',
              `border-${element.rarity}-700/30 ${RARITY_BG[element.rarity ?? 'common']}`
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn('font-mono font-bold', RARITY_COLORS[element.rarity ?? 'common'])}
              >
                {element.symbol}
              </span>
              <span className="text-xs text-cyan-100">{element.name}</span>
            </div>
            <span className="font-mono text-xs text-cyan-200">{slot.quantity}</span>
          </div>
        );
      })}
    </div>
  );
}
