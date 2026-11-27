import { GAME_CONSTANTS } from '@/engine/constants';
import { cn } from '@/lib/utils';

export interface ZoomControlsProps {
  scale: number;
  onZoom: (delta: number) => void;
}

export function ZoomControls({ scale, onZoom }: ZoomControlsProps) {
  const btnClass =
    'px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-bold hover:bg-secondary/80 transition-colors';
  return (
    <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-xl border border-border bg-card/90 px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground">
      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => onZoom(-0.25)}
        disabled={scale <= GAME_CONSTANTS.MIN_MAP_ZOOM}
        className={cn(btnClass, scale <= GAME_CONSTANTS.MIN_MAP_ZOOM ? 'opacity-40' : '')}
      >
        −
      </button>
      <span className="text-foreground">{scale.toFixed(1)}x</span>
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => onZoom(0.25)}
        disabled={scale >= GAME_CONSTANTS.MAX_MAP_ZOOM}
        className={cn(btnClass, scale >= GAME_CONSTANTS.MAX_MAP_ZOOM ? 'opacity-40' : '')}
      >
        +
      </button>
    </div>
  );
}
