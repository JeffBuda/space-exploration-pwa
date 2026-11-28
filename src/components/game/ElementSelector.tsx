import { cn } from '@/lib/utils';
import { ELEMENTS } from '@/lib/elements';
import { RARITY_COLORS, RARITY_RING } from '@/lib/game';

interface ElementSelectorProps {
  selectedSymbol: string | null;
  onSelect: (symbol: string) => void;
}

export function ElementSelector({ selectedSymbol, onSelect }: ElementSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-secondary-foreground">Mine Element</p>
      <div className="flex max-h-[150px] flex-wrap gap-1 overflow-y-auto">
        {ELEMENTS.map((element) => {
          const active = selectedSymbol === element.symbol;
          return (
            <button
              key={element.symbol}
              type="button"
              onClick={() => onSelect(element.symbol)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px]',
                active
                  ? `${RARITY_RING[element.rarity]} border-primary bg-secondary/40 text-foreground`
                  : 'border-border/50 bg-background/20 text-rarity-common hover:border-primary/30'
              )}
            >
              <span className={cn('font-mono font-bold', RARITY_COLORS[element.rarity])}>
                {element.symbol}
              </span>
              <span className={cn(active ? 'text-primary' : 'text-muted-foreground')}>
                +{element.baselineValue}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
