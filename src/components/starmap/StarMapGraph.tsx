import { STAR_CLUSTER, ROUTE_EDGES, StarNode } from '@/lib/starmap';
import { RouteEdgeLines } from './RouteEdgeLines';
import { StarNodeMarker } from './StarNodeMarker';

interface StarMapGraphProps {
  route: readonly string[];
  selectedStar?: string;
  onStarClick: (starId: string) => void;
  inTransit?: boolean;
}

export function StarMapGraph({ route, selectedStar, onStarClick, inTransit }: StarMapGraphProps) {
  const handleClick = (starId: string) => {
    if (inTransit) return;
    onStarClick(starId);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0d1117]">
      <div className="absolute inset-0 h-full w-full opacity-[0.03]">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="none" stroke="currentColor" stroke-width="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <RouteEdgeLines route={route} nodes={STAR_CLUSTER} edges={ROUTE_EDGES} />

      <div className="pointer-events-auto absolute inset-0 h-full w-full">
        {STAR_CLUSTER.map((node: StarNode) => (
          <StarNodeMarker
            key={node.id}
            node={node}
            selected={selectedStar === node.id}
            onClick={handleClick}
          />
        ))}
      </div>
    </div>
  );
}
