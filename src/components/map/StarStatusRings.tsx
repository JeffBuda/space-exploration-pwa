import type { StarNode } from '@/engine/mapTypes';

export interface StarStatusRingsProps {
  node: StarNode;
  isCurrent: boolean;
  isInspected: boolean;
}

/** Renders aura / inspection / spaceport / frontier rings around a star. */
export function StarStatusRings({ node, isCurrent, isInspected }: StarStatusRingsProps) {
  return (
    <>
      {isCurrent && <circle r="18" fill="hsl(var(--color-success))" opacity="0.22" />}
      {isInspected && (
        <circle
          r="14"
          fill="none"
          stroke="hsl(var(--color-warning))"
          strokeWidth="1.75"
          strokeDasharray="3 2"
        />
      )}
      {node.hasSpaceport && (
        <circle
          r="11"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.25"
          strokeOpacity="0.85"
        />
      )}
      {node.isFrontier && !node.hasSpaceport && (
        <circle
          r="10.5"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="1.25"
          strokeDasharray="2 2"
        />
      )}
    </>
  );
}
