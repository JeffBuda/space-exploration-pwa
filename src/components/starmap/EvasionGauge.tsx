import { cn } from '@/lib/utils';

interface EvasionGaugeProps {
  comboTier: number;
  className?: string;
}

export function EvasionGauge({ comboTier, className }: EvasionGaugeProps) {
  const gauge = Math.min(100, comboTier * 5);

  return (
    <div className={cn('mb-2', className)}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] text-secondary-foreground/60">Evasion Probability</span>
        <span className="font-mono text-xs text-secondary-foreground">{gauge.toFixed(0)}%</span>
      </div>
      <div className="bg-surface h-2 w-full overflow-hidden rounded-full">
        <div
          className="h-full bg-gradient-to-r from-primary to-success transition-all duration-200"
          style={{ width: `${Math.max(0, Math.min(100, gauge))}%` }}
        />
      </div>
    </div>
  );
}
