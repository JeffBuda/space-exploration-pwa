import type { StarNode } from '@/engine/mapTypes';

export interface StarCoreCircleProps {
  node: StarNode;
  isCurrent: boolean;
  isSelected: boolean;
}

/** Renders the star core circle (current ship / selected stop / discovered node). */
export function StarCoreCircle({ node, isCurrent, isSelected }: StarCoreCircleProps) {
  const fill = isCurrent
    ? 'hsl(var(--color-success))'
    : isSelected
      ? 'hsl(var(--primary))'
      : 'hsl(var(--foreground))';
  const radius = isCurrent ? 7.5 : isSelected ? 6.5 : 5.5;
  const shown = node.isDiscovered || isCurrent || isSelected;

  return (
    <circle
      r={radius}
      fill={shown ? fill : 'hsl(var(--background))'}
      stroke={shown ? fill : 'hsl(var(--background))'}
      strokeWidth="2"
    />
  );
}
