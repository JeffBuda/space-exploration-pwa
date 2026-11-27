import { lyToCanvasPx } from '@/engine/constants';
import type { RouteEdge, StarNode } from '@/engine/mapTypes';

export interface RouteEdgeProps {
  edge: RouteEdge;
  nodes: Record<string, StarNode>;
  isActive: boolean;
  hopNumber: number;
  travelMinutes: number;
  showLabels: boolean;
}

// eslint-disable-next-line max-lines-per-function
export function RouteEdge({
  edge,
  nodes,
  isActive,
  hopNumber,
  travelMinutes,
  showLabels,
}: RouteEdgeProps) {
  const n1 = nodes[edge.sourceId];
  const n2 = nodes[edge.targetId];
  if (!n1 || !n2) return null;

  const x1 = lyToCanvasPx(n1.x);
  const y1 = lyToCanvasPx(n1.y);
  const x2 = lyToCanvasPx(n2.x);
  const y2 = lyToCanvasPx(n2.y);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <g key={edge.id} data-testid={`route-edge-${edge.sourceId}-${edge.targetId}`}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
        strokeWidth={isActive ? 2.5 : 1.5}
        strokeDasharray={isActive ? undefined : '3 3'}
        className={isActive ? 'animate-hyperlane-flow' : undefined}
      />
      {showLabels && (
        <text
          x={midX}
          y={midY - 6}
          textAnchor="middle"
          fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
          fontSize="8.5"
          className="pointer-events-none font-mono"
        >
          {edge.distanceLY} LY · {travelMinutes}m
        </text>
      )}
      {isActive && (
        <g transform={`translate(${midX}, ${midY + 6})`} className="pointer-events-none">
          <circle
            r="7"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth="1.5"
          />
          <text
            y="3"
            textAnchor="middle"
            fill="hsl(var(--primary-foreground))"
            fontSize="8"
            fontWeight="bold"
            className="font-mono"
          >
            {hopNumber}
          </text>
        </g>
      )}
    </g>
  );
}
