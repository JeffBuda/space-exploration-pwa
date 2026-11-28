import { RouteEdge, StarNode } from '@/lib/starmap';

interface RouteEdgeLinesProps {
  route: readonly string[];
  nodes: readonly StarNode[];
  edges: readonly RouteEdge[];
}

function isActiveEdge(edge: RouteEdge, route: readonly string[]): boolean {
  const fromIdx = route.indexOf(edge.sourceId);
  const toIdx = route.indexOf(edge.targetId);
  return fromIdx >= 0 && toIdx >= 0 && Math.abs(fromIdx - toIdx) === 1;
}

export function RouteEdgeLines({ route, nodes, edges }: RouteEdgeLinesProps) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      {edges.map((edge) => {
        const fromNode = nodes.find((n) => n.id === edge.sourceId);
        const toNode = nodes.find((n) => n.id === edge.targetId);
        if (!fromNode || !toNode) return null;

        const active = isActiveEdge(edge, route);

        return (
          <line
            key={edge.id}
            x1={`${fromNode.x}%`}
            y1={`${fromNode.y}%`}
            x2={`${toNode.x}%`}
            y2={`${toNode.y}%`}
            stroke={active ? '#22d3ee' : '#334155'}
            strokeWidth={active ? 3 : 1}
            strokeDasharray={active ? 'none' : '4,4'}
            strokeOpacity={active ? 1 : 0.3}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}
