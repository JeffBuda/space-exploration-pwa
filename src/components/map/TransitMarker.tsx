import { lyToCanvasPx } from '@/engine/constants';
import type { ActiveTransitVisual, StarNode } from '@/engine/mapTypes';

export interface TransitMarkerProps {
  transit: ActiveTransitVisual;
  nodes: Record<string, StarNode>;
}

export function TransitMarker({ transit, nodes }: TransitMarkerProps) {
  const from = nodes[transit.fromNodeId];
  const to = nodes[transit.toNodeId];
  if (!from || !to) return null;

  const t = Math.min(1, Math.max(0, transit.progressRatio));
  const x = lyToCanvasPx(from.x + (to.x - from.x) * t);
  const y = lyToCanvasPx(from.y + (to.y - from.y) * t);

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="pointer-events-none"
      data-testid="transit-ship-marker"
    >
      <circle r="14" fill="hsl(var(--color-success))" opacity="0.22" />
      <circle
        r="5"
        fill="hsl(var(--color-success))"
        stroke="hsl(var(--background))"
        strokeWidth="1.5"
      />
    </g>
  );
}
