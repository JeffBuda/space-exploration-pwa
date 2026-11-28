import type { MapInteractionMode } from '@/engine/mapTypes';
import { cn } from '@/lib/utils';

export interface MapModeSwitcherProps {
  mode: MapInteractionMode;
  onModeChange: (mode: MapInteractionMode) => void;
}

export function MapModeSwitcher({ mode, onModeChange }: MapModeSwitcherProps) {
  const baseClass = 'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors';
  const activeClass = 'bg-primary text-primary-foreground shadow';
  const inactiveClass = 'text-muted-foreground hover:text-foreground';
  return (
    <div className="absolute left-3 top-3 z-20 flex items-center gap-1 rounded-xl border border-border bg-card/90 p-1 shadow-lg backdrop-blur-sm">
      <button
        type="button"
        aria-label="Edit Route"
        onClick={() => onModeChange('edit_route')}
        className={cn(baseClass, mode === 'edit_route' ? activeClass : inactiveClass)}
      >
        Edit Route
      </button>
      <button
        type="button"
        aria-label="System Info"
        onClick={() => onModeChange('info')}
        className={cn(
          baseClass,
          mode === 'info'
            ? 'bg-[hsl(var(--color-warning))] text-primary-foreground shadow'
            : inactiveClass
        )}
      >
        System Info
      </button>
    </div>
  );
}
