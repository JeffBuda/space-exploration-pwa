/**
 * Star map data contracts and deterministic mock cluster.
 * Seed: "sol-prime-001" — the pre-scanned starting region around Sol.
 */

export type SystemStatus = 'current' | 'discovered' | 'unknown';

export interface StarNode {
  id: string;
  name: string;
  x: number; // Percentage (10-90) within safe map canvas bounds
  y: number; // Percentage (15-62) above default drawer height
  status: SystemStatus;
  hasSpaceport: boolean; // ~10% of safe systems + starter Sol
  bodyCount: number;
  resourceHints: string[]; // Pre-scan orbital/spectral Periodic Table hints
}

export interface RouteEdge {
  id: string;
  sourceId: string;
  targetId: string;
  distanceLY: number;
  travelSeconds: number;
  energyCost: number;
}

export interface RouteHop {
  fromId: string;
  toId: string;
  edge: RouteEdge;
  distanceLY: number;
  travelSeconds: number;
  energyCost: number;
}

// ── Deterministic star cluster (seeded by "sol-prime-001") ───────────────
export const ORIGINAL_SEED = 'sol-prime-001';
export const START_SYSTEM_ID = 'sol';

export const STAR_CLUSTER: readonly StarNode[] = [
  {
    id: 'sol',
    name: 'Sol',
    x: 50,
    y: 55,
    status: 'current',
    hasSpaceport: true,
    bodyCount: 8,
    resourceHints: ['H', 'He', 'C', 'N', 'O'],
  },
  {
    id: 'proxima',
    name: 'Proxima Centauri',
    x: 28,
    y: 42,
    status: 'discovered',
    hasSpaceport: true,
    bodyCount: 3,
    resourceHints: ['H', 'Fe', 'Si'],
  },
  {
    id: 'epsilon',
    name: 'Epsilon Eridani',
    x: 72,
    y: 44,
    status: 'discovered',
    hasSpaceport: false,
    bodyCount: 5,
    resourceHints: ['H', 'C', 'Fe'],
  },
  {
    id: 'tauceti',
    name: 'Tau Ceti',
    x: 16,
    y: 26,
    status: 'discovered',
    hasSpaceport: true,
    bodyCount: 4,
    resourceHints: ['H', 'Si', 'Mg'],
  },
  {
    id: 'kepler',
    name: 'Kepler-186',
    x: 49,
    y: 28,
    status: 'unknown',
    hasSpaceport: false,
    bodyCount: 6,
    resourceHints: ['He', 'O', 'Ti'],
  },
  {
    id: 'barnard',
    name: "Barnard's Star",
    x: 84,
    y: 22,
    status: 'unknown',
    hasSpaceport: false,
    bodyCount: 2,
    resourceHints: ['H', 'Al'],
  },
  {
    id: 'cygnus',
    name: 'Cygnus-X',
    x: 36,
    y: 16,
    status: 'unknown',
    hasSpaceport: false,
    bodyCount: 1,
    resourceHints: ['H', 'He', 'Au'],
  },
];

// ── Edges (undirected routes between adjacent systems) ──────────────────
function makeEdge(
  sourceId: string,
  targetId: string,
  distanceLY: number,
  travelSeconds: number,
  energyCost: number
): RouteEdge {
  return {
    id: `${sourceId}-${targetId}`,
    sourceId,
    targetId,
    distanceLY,
    travelSeconds,
    energyCost,
  };
}

export const ROUTE_EDGES: readonly RouteEdge[] = [
  makeEdge('sol', 'proxima', 4.2, 126, 42),
  makeEdge('sol', 'epsilon', 5.6, 168, 56),
  makeEdge('proxima', 'tauceti', 3.8, 114, 38),
  makeEdge('proxima', 'kepler', 5.1, 153, 51),
  makeEdge('epsilon', 'kepler', 4.5, 135, 45),
  makeEdge('epsilon', 'barnard', 7.2, 216, 72),
  makeEdge('kepler', 'barnard', 3.0, 90, 30),
  makeEdge('kepler', 'cygnus', 9.5, 285, 95),
  makeEdge('barnard', 'cygnus', 6.4, 192, 64),
  makeEdge('tauceti', 'kepler', 6.7, 201, 67),
];

// ── Pirate hazard system (ambush triggers on arrival) ───────────────────
export const PIRATE_HAZARD_SYSTEM_IDS = ['cygnus'] as const;

// ── Starter cargo (for pirate ambush demo) ───────────────────────────────
export interface CargoSlot {
  symbol: string;
  name: string;
  quantity: number;
}

export const STARTER_CARGO: readonly CargoSlot[] = [
  { symbol: 'Fe', name: 'Iron', quantity: 40 },
  { symbol: 'Au', name: 'Gold', quantity: 15 },
  { symbol: 'Si', name: 'Silicon', quantity: 25 },
];

// ── Pure helpers ─────────────────────────────────────────────────────────

export function getStarNode(id: string): StarNode | undefined {
  return STAR_CLUSTER.find((n) => n.id === id);
}

export function getStarName(id: string): string {
  return getStarNode(id)?.name ?? id;
}

export function findEdgeBetween(aId: string, bId: string): RouteEdge | undefined {
  return ROUTE_EDGES.find(
    (e) => (e.sourceId === aId && e.targetId === bId) || (e.sourceId === bId && e.targetId === aId)
  );
}

/** Build the contiguous hop list for a route array, or [] if any hop is missing. */
export function buildRouteHops(route: readonly string[]): RouteHop[] {
  const hops: RouteHop[] = [];
  for (let i = 0; i < route.length - 1; i += 1) {
    const edge = findEdgeBetween(route[i], route[i + 1]);
    if (!edge) return [];
    hops.push({
      fromId: edge.sourceId === route[i] ? edge.sourceId : route[i],
      toId: edge.sourceId === route[i] ? edge.targetId : route[i + 1],
      edge,
      distanceLY: edge.distanceLY,
      travelSeconds: edge.travelSeconds,
      energyCost: edge.energyCost,
    });
  }
  return hops;
}

export function isRouteContiguous(route: readonly string[]): boolean {
  if (route.length < 2) return true;
  return buildRouteHops(route).length === route.length - 1;
}

export function isPirateHazardSystem(nodeId: string | null): boolean {
  if (!nodeId) return false;
  return (PIRATE_HAZARD_SYSTEM_IDS as readonly string[]).includes(nodeId);
}
