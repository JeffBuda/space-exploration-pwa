import { lyToCanvasPx } from '@/engine/constants';
import { cn } from '@/lib/utils';
import type { MouseEvent as ReactMouseEvent } from 'react';
import type { StarNode } from '@/engine/mapTypes';
import { StarCoreCircle } from './StarCoreCircle';
import { StarNodeLabel } from './StarNodeLabel';
import { StarStatusRings } from './StarStatusRings';

export interface StarNodeViewProps {
  node: StarNode;
  isCurrent: boolean;
  isSelected: boolean;
  isInspected: boolean;
  showLabels: boolean;
  hitSlopSize: number;
  onNodeTap: (nodeId: string) => void;
  showShipAura?: boolean;
}

export function StarNodeView({
  node,
  isCurrent,
  isSelected,
  isInspected,
  showLabels,
  hitSlopSize,
  onNodeTap,
  showShipAura = false,
}: StarNodeViewProps) {
  const handleClick = (event: ReactMouseEvent<SVGGElement>) => {
    event.stopPropagation();
    onNodeTap(node.id);
  };

  return (
    <g
      transform={`translate(${lyToCanvasPx(node.x)}, ${lyToCanvasPx(node.y)})`}
      onClick={handleClick}
      className={cn(
        'cursor-pointer touch-none',
        showShipAura && isCurrent ? 'pointer-events-auto' : undefined
      )}
      role="button"
      aria-label={`${node.name}${isCurrent ? ' (Current Location)' : ''}`}
    >
      {/* Counter-scaled >=44x44px invisible iOS thumb hitbox */}
      <rect
        x={-hitSlopSize / 2}
        y={-hitSlopSize / 2}
        width={hitSlopSize}
        height={hitSlopSize}
        fill="transparent"
      />

      {showShipAura && isCurrent && (
        <circle r="18" fill="hsl(var(--color-success))" opacity="0.22" />
      )}
      <StarStatusRings node={node} isCurrent={isCurrent} isInspected={isInspected} />
      <StarCoreCircle node={node} isCurrent={isCurrent} isSelected={isSelected} />
      {showLabels && <StarNodeLabel node={node} isCurrent={isCurrent} isSelected={isSelected} />}
    </g>
  );
}
