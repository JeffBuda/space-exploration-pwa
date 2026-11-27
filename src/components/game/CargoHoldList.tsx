import { cn } from '@/lib/utils';
import { ELEMENTS, type ElementRarity } from '@/lib/elements';
import { RARITY_COLORS, RARITY_BG } from '@/lib/game';

interface CargoHoldListProps {
  cargoHold: { symbol: string; quantity: number }[];
}

const RARITY_BORDER: Record<ElementRarity, string> = {
  common: 'border-slate-700/30',
  uncommon: 'border-cyan-700/30',
  rare: 'border-amber-700/30',
  epic: 'border-purple-700/30',
  legendary: 'border-yellow-700/30',
};

export function CargoHoldList({ cargoHold }: CargoHoldListProps) {
  if (cargoHold.length === 0) {
    return <p className="py-2 text-center text-xs text-slate-500">Empty hold</p>;
  }
  return (
    <div className="max-h-[40vh] space-y-1 overflow-y-auto">
      {cargoHold.map((slot) => {
        const element = ELEMENTS.find((e) => e.symbol === slot.symbol);
        if (!element) return null;
        const rarity = element.rarity ?? 'common';
        return (
          <div
            key={element.symbol}
            className={cn(
              'flex items-center justify-between rounded-lg border p-2',
              RARITY_BORDER[rarity],
              RARITY_BG[rarity]
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn('font-mono font-bold', RARITY_COLORS[rarity])}>
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
