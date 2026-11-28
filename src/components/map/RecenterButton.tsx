import { cn } from '@/lib/utils';

export function RecenterButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'absolute bottom-3 right-3 z-20 rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground shadow-lg transition-opacity active:opacity-80'
      )}
    >
      Re-center Ship
    </button>
  );
}
