import { StarNode } from '@/lib/starmap';
import { cn } from '@/lib/utils';

interface StarNodeMarkerProps {
  node: StarNode;
  selected: boolean;
  onClick: (starId: string) => void;
}

const STATUS_VISUALS = {
  current: { color: 'text-success', bg: 'bg-success-bg/20', ring: 'ring-success' },
  discovered: { color: 'text-secondary-foreground', bg: 'bg-secondary/30', ring: 'ring-primary' },
  unknown: { color: 'text-primary/40', bg: 'bg-secondary/10', ring: 'ring-rarity-uncommon' },
} as const;

export function getStarVisual(node: StarNode, selected: boolean) {
  const base =
    node.status === 'current'
      ? STATUS_VISUALS.current
      : node.status === 'discovered'
        ? STATUS_VISUALS.discovered
        : STATUS_VISUALS.unknown;

  if (selected) {
    return {
      color: 'text-secondary-foreground',
      bg: 'bg-secondary/40',
      ring: 'ring-2 ring-primary',
    };
  }
  return {
    color: base.color,
    bg: base.bg,
    ring: `ring-2 ${base.ring}`,
  };
}

export function StarNodeMarker({ node, selected, onClick }: StarNodeMarkerProps) {
  const { color, bg, ring } = getStarVisual(node, selected);

  return (
    <div
      className="relative"
      style={{
        position: 'absolute',
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <button
        type="button"
        onClick={() => onClick(node.id)}
        className={cn(
          'relative flex h-11 w-11 items-center justify-center rounded-full',
          'cursor-pointer transition-all duration-200 before:absolute before:inset-0 before:content-[""]',
          'after:absolute after:inset-0 after:h-[44px] after:w-[44px] after:content-[""]',
          color,
          bg
        )}
        style={{
          minWidth: '44px',
          minHeight: '44px',
        }}
      >
        <div className="h-4 w-4 rounded-full bg-current opacity-80" />
        {node.status === 'current' && (
          <div
            className="absolute -inset-1 animate-pulse rounded-full"
            style={{ border: '2px solid currentColor', opacity: 0.3 }}
          />
        )}
        {selected && <div className={cn('absolute -inset-1 rounded-full ring-2', ring)} />}
        <span
          className={cn(
            'absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px]',
            color
          )}
        >
          {node.name}
        </span>
      </button>
    </div>
  );
}
