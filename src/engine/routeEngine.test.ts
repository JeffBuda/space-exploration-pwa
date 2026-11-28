import { describe, it, expect } from 'vitest';
import {
  computeDistanceLY,
  sanitizeAnchoredRoute,
  findShortestPath,
  selectNodeInEditMode,
  computeRouteSummary,
  resolveEmergencyDropNodeId,
  expandSectorFrontier,
} from './routeEngine';
import { GAME_CONSTANTS, lyToCanvasPx, canvasPxToLy } from './constants';
import type { StarNode, RouteEdge } from './mapTypes';

// ── Fixtures ──────────────────────────────────────────────────────────────

function makeNode(id: string, x: number, y: number, overrides: Partial<StarNode> = {}): StarNode {
  return {
    id,
    name: id.toUpperCase(),
    x,
    y,
    isDiscovered: true,
    hasSpaceport: false,
    isFrontier: false,
    safety: 'Safe',
    bodyCount: 2,
    resourceHints: ['H', 'He'],
    ...overrides,
  };
}

function makeEdge(id: string, sourceId: string, targetId: string, distanceLY: number): RouteEdge {
  return { id, sourceId, targetId, distanceLY };
}

/** Simple 4-node line graph plus an unreachable node. */
function makeGraph(): { nodes: Record<string, StarNode>; edges: RouteEdge[] } {
  const nodes: Record<string, StarNode> = {
    A: makeNode('A', 0, 0),
    B: makeNode('B', 3, 0),
    C: makeNode('C', 6, 0),
    D: makeNode('D', 9, 0),
    Z: makeNode('Z', 100, 100),
  };
  const edges: RouteEdge[] = [
    makeEdge('A-B', 'A', 'B', 3),
    makeEdge('B-C', 'B', 'C', 3),
    makeEdge('C-D', 'C', 'D', 3),
    makeEdge('A-C', 'A', 'C', 8),
  ];
  return { nodes, edges };
}

// ── Constants ─────────────────────────────────────────────────────────────

describe('constants', () => {
  it('converts light-years to canvas pixels and back', () => {
    expect(lyToCanvasPx(5)).toBe(5 * GAME_CONSTANTS.PIXELS_PER_LY);
    expect(canvasPxToLy(lyToCanvasPx(7.5))).toBeCloseTo(7.5, 6);
  });

  it('declares integer-friendly energy constants', () => {
    expect(GAME_CONSTANTS.ENERGY_PER_LY).toBe(1);
    expect(GAME_CONSTANTS.SECONDS_PER_LY).toBe(60);
  });
});

// ── computeDistanceLY ──────────────────────────────────────────────────────

describe('computeDistanceLY', () => {
  it('computes Euclidean distance rounded to one decimal', () => {
    const { nodes } = makeGraph();
    expect(computeDistanceLY(nodes.A, nodes.B)).toBe(3);
    expect(computeDistanceLY(nodes.A, nodes.D)).toBe(9);
  });

  it('is symmetric and pure on frozen nodes', () => {
    const { nodes } = makeGraph();
    const frozen = Object.freeze(nodes.A);
    const frozenB = Object.freeze(nodes.B);
    expect(computeDistanceLY(frozen, frozenB)).toBe(computeDistanceLY(frozenB, frozen));
  });
});

// ── sanitizeAnchoredRoute ──────────────────────────────────────────────────

describe('sanitizeAnchoredRoute', () => {
  it('strips a leading currentLocationId at index 0', () => {
    expect(sanitizeAnchoredRoute('A', ['A', 'B', 'C'])).toEqual(['B', 'C']);
  });

  it('keeps the tail when the origin is not present', () => {
    expect(sanitizeAnchoredRoute('A', ['B', 'C'])).toEqual(['B', 'C']);
  });

  it('truncates on a repeated origin / cycle', () => {
    expect(sanitizeAnchoredRoute('A', ['B', 'C', 'A', 'D'])).toEqual(['B', 'C']);
  });

  it('drops duplicate stops', () => {
    expect(sanitizeAnchoredRoute('A', ['B', 'C', 'B', 'D'])).toEqual(['B', 'C']);
  });

  it('does not mutate a frozen input array', () => {
    const frozen = Object.freeze(['A', 'B', 'A', 'C']);
    expect(sanitizeAnchoredRoute('A', frozen)).toEqual(['B']);
    expect(frozen).toEqual(['A', 'B', 'A', 'C']);
  });
});

// ── findShortestPath ───────────────────────────────────────────────────────

describe('findShortestPath', () => {
  it('finds the lowest-energy multi-hop path', () => {
    const { edges } = makeGraph();
    // A-B-C-D costs 3+3+3 = 9 EN; A-C-D costs 8+3 = 11 EN.
    expect(findShortestPath(edges, 'A', 'D')).toEqual(['A', 'B', 'C', 'D']);
  });

  it('returns a single-element path for the same node', () => {
    const { edges } = makeGraph();
    expect(findShortestPath(edges, 'A', 'A')).toEqual(['A']);
  });

  it('returns null for disconnected nodes', () => {
    const { edges } = makeGraph();
    expect(findShortestPath(edges, 'A', 'Z')).toBeNull();
  });

  it('handles bidirectional edges', () => {
    const edges = [makeEdge('A-B', 'A', 'B', 3)];
    expect(findShortestPath(edges, 'B', 'A')).toEqual(['B', 'A']);
  });

  it('does not mutate frozen inputs', () => {
    const { edges } = makeGraph();
    const frozenEdges = Object.freeze(edges.map((e) => Object.freeze(e)));
    findShortestPath(frozenEdges, 'A', 'D');
    expect(frozenEdges).toEqual(edges);
  });
});

// ── selectNodeInEditMode ────────────────────────────────────────────────────

describe('selectNodeInEditMode', () => {
  const baseInput = () => {
    const { nodes, edges } = makeGraph();
    return {
      currentLocationId: 'A',
      activeRoute: ['B', 'C'],
      nodes,
      edges,
    };
  };

  it('tapping the current location clears the route', () => {
    const result = selectNodeInEditMode({ ...baseInput(), tappedNodeId: 'A' });
    expect(result.activeRoute).toEqual([]);
    expect(result.error).toBeNull();
  });

  it('tapping the tail node pops only the last stop', () => {
    const result = selectNodeInEditMode({ ...baseInput(), tappedNodeId: 'C' });
    expect(result.activeRoute).toEqual(['B']);
    expect(result.error).toBeNull();
  });

  it('tapping an earlier mid-route node severs all downstream stops', () => {
    const result = selectNodeInEditMode({ ...baseInput(), tappedNodeId: 'B' });
    expect(result.activeRoute).toEqual(['B']);
    expect(result.error).toBeNull();
  });

  it('tapping a distant reachable node appends the shortest path from the tail', () => {
    const result = selectNodeInEditMode({ ...baseInput(), tappedNodeId: 'D' });
    // Tail is C; shortest path C→D = ['C','D']; append the remainder.
    expect(result.activeRoute).toEqual(['B', 'C', 'D']);
    expect(result.error).toBeNull();
  });

  it('tapping an unreachable node leaves the route untouched and returns an error', () => {
    const result = selectNodeInEditMode({ ...baseInput(), tappedNodeId: 'Z' });
    expect(result.activeRoute).toEqual(['B', 'C']);
    expect(result.error).toMatch(/No charted hyperlane path to Z/);
  });

  it('appends from the origin when the route is empty', () => {
    const result = selectNodeInEditMode({ ...baseInput(), activeRoute: [], tappedNodeId: 'D' });
    // Shortest path A→D = ['A','B','C','D']; append remainder.
    expect(result.activeRoute).toEqual(['B', 'C', 'D']);
    expect(result.error).toBeNull();
  });

  it('is pure on frozen inputs', () => {
    const { nodes, edges } = makeGraph();
    const frozenNodes = Object.freeze(
      Object.fromEntries(Object.entries(nodes).map(([k, v]) => [k, Object.freeze(v)]))
    );
    const frozenEdges = Object.freeze(edges.map((e) => Object.freeze(e)));
    const frozenRoute = Object.freeze(['B', 'C']);
    selectNodeInEditMode({
      currentLocationId: 'A',
      activeRoute: frozenRoute,
      tappedNodeId: 'D',
      nodes: frozenNodes,
      edges: frozenEdges,
    });
    expect(frozenRoute).toEqual(['B', 'C']);
  });
});

// ── computeRouteSummary ────────────────────────────────────────────────────

describe('computeRouteSummary', () => {
  it('computes energy (ceil 1 EN per LY), duration (60s per LY), and affordability', () => {
    const { nodes, edges } = makeGraph();
    const summary = computeRouteSummary(nodes, edges, 'A', ['B', 'C'], 100);

    expect(summary.legs).toHaveLength(2);
    expect(summary.totalDistanceLY).toBe(6);
    expect(summary.totalEnergyCost).toBe(6);
    // 3 LY → max(1, round(3*60/60)) = 3 min = 180s per leg.
    expect(summary.totalDurationSeconds).toBe(360);
    expect(summary.canAfford).toBe(true);
    expect(summary.energyShortfall).toBe(0);
  });

  it('reports energy shortfall when energy is insufficient', () => {
    const { nodes, edges } = makeGraph();
    const summary = computeRouteSummary(nodes, edges, 'A', ['B', 'C'], 5);
    expect(summary.canAfford).toBe(false);
    expect(summary.energyShortfall).toBe(1);
  });

  it('uses Math.ceil for integer energy', () => {
    const nodes: Record<string, StarNode> = {
      A: makeNode('A', 0, 0),
      B: makeNode('B', 1.2, 0), // distance 1.2 → ceil = 2 EN
    };
    const edges = [makeEdge('A-B', 'A', 'B', 1.2)];
    const summary = computeRouteSummary(nodes, edges, 'A', ['B'], 100);
    expect(summary.totalEnergyCost).toBe(2);
  });

  it('is pure on frozen inputs', () => {
    const { nodes, edges } = makeGraph();
    const frozenNodes = Object.freeze(
      Object.fromEntries(Object.entries(nodes).map(([k, v]) => [k, Object.freeze(v)]))
    );
    const frozenEdges = Object.freeze(edges.map((e) => Object.freeze(e)));
    const frozenRoute = Object.freeze(['B']);
    computeRouteSummary(frozenNodes, frozenEdges, 'A', frozenRoute, 100);
    expect(frozenRoute).toEqual(['B']);
  });
});

// ── resolveEmergencyDropNodeId ─────────────────────────────────────────────

describe('resolveEmergencyDropNodeId', () => {
  it('returns the origin for progress below 0.5', () => {
    expect(resolveEmergencyDropNodeId('A', 'B', 0.3)).toBe('A');
    expect(resolveEmergencyDropNodeId('A', 'B', 0.49)).toBe('A');
  });

  it('returns the destination for progress at or above 0.5', () => {
    expect(resolveEmergencyDropNodeId('A', 'B', 0.5)).toBe('B');
    expect(resolveEmergencyDropNodeId('A', 'B', 0.9)).toBe('B');
  });
});

// ── expandSectorFrontier ────────────────────────────────────────────────────

describe('expandSectorFrontier', () => {
  it('adds exactly FRONTIER_NODES_PER_SCAN new nodes and connecting edges', () => {
    const { nodes, edges } = makeGraph();
    const result = expandSectorFrontier('A', nodes, edges, 7);

    expect(result.addedNodeIds).toHaveLength(GAME_CONSTANTS.FRONTIER_NODES_PER_SCAN);
    expect(result.addedNodeIds).toEqual(['A-chart-1', 'A-chart-2']);
    expect(result.edges.length).toBe(edges.length + GAME_CONSTANTS.FRONTIER_NODES_PER_SCAN);
  });

  it('marks new nodes as frontier and is deterministic for identical seeds', () => {
    const { nodes, edges } = makeGraph();
    const first = expandSectorFrontier('A', nodes, edges, 42);
    const second = expandSectorFrontier('A', nodes, edges, 42);

    expect(first.addedNodeIds).toEqual(second.addedNodeIds);
    for (const id of first.addedNodeIds) {
      expect(first.nodes[id].isFrontier).toBe(true);
      expect(second.nodes[id].x).toBeCloseTo(first.nodes[id].x, 10);
      expect(second.nodes[id].y).toBeCloseTo(first.nodes[id].y, 10);
    }
  });

  it('enforces MIN_NODE_SPACING_LY from every existing node', () => {
    const { nodes, edges } = makeGraph();
    const result = expandSectorFrontier('A', nodes, edges, 123);

    const existing = [
      ...Object.values(nodes),
      ...result.addedNodeIds.map((id) => result.nodes[id]),
    ];
    for (const node of result.addedNodeIds.map((id) => result.nodes[id])) {
      for (const other of existing) {
        if (other.id === node.id) continue;
        const d = Math.hypot(node.x - other.x, node.y - other.y);
        expect(d).toBeGreaterThanOrEqual(GAME_CONSTANTS.MIN_NODE_SPACING_LY - 1e-6);
      }
    }
  });

  it('returns a no-op expansion for an unknown frontier id', () => {
    const { nodes, edges } = makeGraph();
    const result = expandSectorFrontier('MISSING', nodes, edges, 7);
    expect(result.addedNodeIds).toEqual([]);
    expect(result.nodes).toBe(nodes);
    expect(result.edges).toBe(edges);
  });

  it('does not mutate frozen inputs', () => {
    const { nodes, edges } = makeGraph();
    const frozenNodes = Object.freeze(
      Object.fromEntries(Object.entries(nodes).map(([k, v]) => [k, Object.freeze(v)]))
    );
    const frozenEdges = Object.freeze(edges.map((e) => Object.freeze(e)));
    expandSectorFrontier('A', frozenNodes, frozenEdges, 9);
    expect(Object.keys(frozenNodes).length).toBe(Object.keys(nodes).length);
    expect(frozenEdges.length).toBe(edges.length);
  });
});
