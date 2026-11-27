import type { StarNode } from '@/engine/mapTypes';

export interface StarNodeLabelProps {
  node: StarNode;
  isCurrent: boolean;
  isSelected: boolean;
}

/** Renders the star name and badges (PORT / FRONTIER). */
export function StarNodeLabel({ node, isCurrent, isSelected }: StarNodeLabelProps) {
  const color = isCurrent
    ? 'hsl(var(--color-success))'
    : isSelected
      ? 'hsl(var(--primary))'
      : 'hsl(var(--foreground))';
  const weight = isCurrent || isSelected ? 'bold' : 'normal';

  return (
    <g className="pointer-events-none">
      <text y="20" textAnchor="middle" fill={color} fontSize="10" fontWeight={weight}>
        {node.name}
      </text>
      {node.hasSpaceport && (
        <text
          y="30"
          textAnchor="middle"
          fill="hsl(var(--primary))"
          fontSize="7.5"
          className="font-mono"
        >
          [PORT]
        </text>
      )}
      {!node.hasSpaceport && node.isFrontier && (
        <text
          y="30"
          textAnchor="middle"
          fill="hsl(var(--accent))"
          fontSize="7.5"
          className="font-mono"
        >
          [FRONTIER]
        </text>
      )}
    </g>
  );
}
