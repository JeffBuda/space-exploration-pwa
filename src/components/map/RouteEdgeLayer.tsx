import { GAME_CONSTANTS } from '@/engine/constants';
import type { RouteEdge, StarNode } from '@/engine/mapTypes';
import { RouteEdge as RouteEdgeView } from './RouteEdge';

export interface RouteEdgeLayerProps {
  edges: RouteEdge[];
  nodes: Record<string, StarNode>;
  anchoredChain: string[];
  showLabels: boolean;
}

interface EdgeRenderState {
  edge: RouteEdge;
  isActive: boolean;
  hopNumber: number;
  travelMinutes: number;
}

/** Compute the per-edge display state from the anchored chain. */
function resolveEdgeState(
  edge: RouteEdge,
  nodes: Record<string, StarNode>,
  chainIndex: Map<string, number>
): EdgeRenderState | null {
  const n1 = nodes[edge.sourceId];
  const n2 = nodes[edge.targetId];
  if (!n1 || !n2) return null;

  const i1 = chainIndex.get(edge.sourceId);
  const i2 = chainIndex.get(edge.targetId);
  const isActive = i1 !== undefined && i2 !== undefined && i1 < i2;
  const hopNumber = isActive ? (i1 as number) + 1 : 0;

  const travelMinutes = Math.max(
    1,
    Math.round((edge.distanceLY * GAME_CONSTANTS.SECONDS_PER_LY) / 60)
  );

  return { edge, isActive, hopNumber, travelMinutes };
}

export function RouteEdgeLayer({ edges, nodes, anchoredChain, showLabels }: RouteEdgeLayerProps) {
  const chainIndex = new Map<string, number>();
  for (let i = 0; i < anchoredChain.length; i++) {
    chainIndex.set(anchoredChain[i], i);
  }

  return (
    <>
      {edges.map((edge) => {
        const state = resolveEdgeState(edge, nodes, chainIndex);
        if (!state) return null;
        return (
          <RouteEdgeView
            key={state.edge.id}
            edge={state.edge}
            nodes={nodes}
            isActive={state.isActive}
            hopNumber={state.hopNumber}
            travelMinutes={state.travelMinutes}
            showLabels={showLabels}
          />
        );
      })}
    </>
  );
}
