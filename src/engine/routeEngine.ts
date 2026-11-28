/**
 * Pure route engine for the Star Map.
 *
 * Enforces the single canonical route invariant: there is exactly one
 * active route and it is always anchored at `currentLocationId` —
 * the full chain is `[currentLocationId, ...activeRoute]`.
 *
 * All functions are side-effect free and have no React dependencies.
 */
import { GAME_CONSTANTS } from './constants';
import type {
  EditModeSelectionResult,
  FrontierExpansionResult,
  RouteEdge,
  RouteLeg,
  RouteSummary,
  StarNode,
} from './mapTypes';

// ── Helpers ──────────────────────────────────────────────────────────────

/** Energy cost for a hyperlane of the given distance (ceiled integer). */
function energyCostForDistance(distanceLY: number): number {
  return Math.ceil(distanceLY * GAME_CONSTANTS.ENERGY_PER_LY);
}

/** Travel time in whole minutes (rounded, minimum 1 minute). */
function durationSecondsForDistance(distanceLY: number): number {
  const minutes = Math.max(1, Math.round((distanceLY * GAME_CONSTANTS.SECONDS_PER_LY) / 60));
  return minutes * 60;
}

/** Find an edge between two nodes (bidirectional). */
function findEdge(
  edges: readonly RouteEdge[],
  fromId: string,
  toId: string
): RouteEdge | undefined {
  return edges.find(
    (e) =>
      (e.sourceId === fromId && e.targetId === toId) ||
      (e.sourceId === toId && e.targetId === fromId)
  );
}

/** Compute Euclidean distance between two nodes in light-years. */
export function computeDistanceLY(a: StarNode, b: StarNode): number {
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 10) / 10;
}

/** Resolve distance for a route leg: use edge distance if charted, else geometric. */
function resolveLegDistance(
  nodes: Record<string, StarNode>,
  edges: readonly RouteEdge[],
  fromId: string,
  toId: string
): number {
  const edge = findEdge(edges, fromId, toId);
  if (edge) return edge.distanceLY;
  const a = nodes[fromId];
  const b = nodes[toId];
  return a && b ? computeDistanceLY(a, b) : 0;
}

// ── Canonical route invariant ────────────────────────────────────────────

/**
 * Sanitize a requested route into the canonical anchored form.
 *
 * The canonical route is the *post-origin* stop list `activeRoute`.
 * The input may include the origin at index 0, may have duplicates,
 * or may stop when the origin appears again. We keep only the first
 * contiguous, unique tail starting after the origin.
 */
export function sanitizeAnchoredRoute(
  currentLocationId: string,
  requestedRoute: readonly string[]
): string[] {
  const start = requestedRoute[0] === currentLocationId ? 1 : 0;
  const tail: string[] = [];
  for (let i = start; i < requestedRoute.length; i++) {
    const id = requestedRoute[i];
    if (id === currentLocationId || tail.includes(id)) break;
    tail.push(id);
  }
  return tail;
}

// ── Shortest path (Dijkstra) ─────────────────────────────────────────────

/**
 * Find the lowest-energy path between two nodes using Dijkstra.
 * Returns node-id chain including both endpoints, or null if disconnected.
 */
export function findShortestPath(
  edges: readonly RouteEdge[],
  fromNodeId: string,
  toNodeId: string
): string[] | null {
  if (fromNodeId === toNodeId) return [fromNodeId];

  // Build adjacency map with energy costs
  const adj = new Map<string, Array<{ to: string; cost: number }>>();
  for (const e of edges) {
    const cost = energyCostForDistance(e.distanceLY);
    const aList = adj.get(e.sourceId) ?? [];
    aList.push({ to: e.targetId, cost });
    adj.set(e.sourceId, aList);
    const bList = adj.get(e.targetId) ?? [];
    bList.push({ to: e.sourceId, cost });
    adj.set(e.targetId, bList);
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const visited = new Set<string>();
  dist.set(fromNodeId, 0);

  // Simple O(V^2) Dijkstra — graph is small (≤ 50 nodes)
  while (true) {
    let currentId: string | null = null;
    let best = Infinity;
    for (const [id, d] of dist) {
      if (!visited.has(id) && d < best) {
        best = d;
        currentId = id;
      }
    }
    if (currentId === null) break;
    if (currentId === toNodeId) break;
    visited.add(currentId);
    for (const { to, cost } of adj.get(currentId) ?? []) {
      if (visited.has(to)) continue;
      const next = best + cost;
      const known = dist.get(to);
      if (known === undefined || next < known) {
        dist.set(to, next);
        prev.set(to, currentId);
      }
    }
  }

  if (!dist.has(toNodeId)) return null;

  // Reconstruct path
  const path: string[] = [];
  let cursor = toNodeId;
  while (cursor !== fromNodeId) {
    path.push(cursor);
    cursor = prev.get(cursor)!;
  }
  path.push(fromNodeId);
  return path.reverse();
}

// ── Edit-mode selection logic ────────────────────────────────────────────

export interface EditModeSelectionInput {
  currentLocationId: string;
  activeRoute: readonly string[];
  tappedNodeId: string;
  nodes: Record<string, StarNode>;
  edges: readonly RouteEdge[];
}

/**
 * Apply a node tap in edit-route mode.
 *
 * Rules:
 * - Tapping current location clears the route.
 * - Tapping the tail node pops it.
 * - Tapping an earlier middle node severs all downstream stops.
 * - Tapping any other reachable node appends the shortest path from the tail.
 * - Tapping an unreachable node leaves the route unchanged and returns an error.
 */
export function selectNodeInEditMode(input: EditModeSelectionInput): EditModeSelectionResult {
  const { currentLocationId, activeRoute, tappedNodeId, nodes, edges } = input;

  // Tap on current location → clear route
  if (tappedNodeId === currentLocationId) {
    return { activeRoute: [], error: null };
  }

  const existingIndex = activeRoute.indexOf(tappedNodeId);
  if (existingIndex !== -1) {
    // Tail pop or middle sever
    if (existingIndex === activeRoute.length - 1) {
      // Tap on tail → pop
      return { activeRoute: activeRoute.slice(0, -1), error: null };
    }
    // Tap on middle → keep up to and including tapped node
    return { activeRoute: activeRoute.slice(0, existingIndex + 1), error: null };
  }

  // Tap on new node → append shortest path from current tail
  const tailId = activeRoute.length > 0 ? activeRoute[activeRoute.length - 1] : currentLocationId;
  const path = findShortestPath(edges, tailId, tappedNodeId);
  if (!path) {
    const name = nodes[tappedNodeId]?.name ?? tappedNodeId;
    return { activeRoute: [...activeRoute], error: `No charted hyperlane path to ${name}.` };
  }
  // Path includes tailId at index 0; append the rest
  return { activeRoute: [...activeRoute, ...path.slice(1)], error: null };
}

// ── Route summary ────────────────────────────────────────────────────────

/**
 * Compute full route summary for the anchored route chain.
 */
export function computeRouteSummary(
  nodes: Record<string, StarNode>,
  edges: readonly RouteEdge[],
  currentLocationId: string,
  activeRoute: readonly string[],
  currentEnergy: number
): RouteSummary {
  const sanitized = sanitizeAnchoredRoute(currentLocationId, activeRoute);
  const chain = [currentLocationId, ...sanitized];
  const legs: RouteLeg[] = [];

  for (let i = 0; i < chain.length - 1; i++) {
    const fromId = chain[i];
    const toId = chain[i + 1];
    const toNode = nodes[toId];
    if (!toNode) continue;

    const distanceLY = resolveLegDistance(nodes, edges, fromId, toId);
    const energyCost = energyCostForDistance(distanceLY);
    const durationSeconds = durationSecondsForDistance(distanceLY);

    legs.push({
      legIndex: i,
      fromNodeId: fromId,
      toNodeId: toId,
      toNodeName: toNode.name,
      distanceLY,
      energyCost,
      durationSeconds,
    });
  }

  const totalEnergyCost = legs.reduce((sum, l) => sum + l.energyCost, 0);
  const totalDistanceLY = legs.reduce((sum, l) => sum + l.distanceLY, 0);
  const totalDurationSeconds = legs.reduce((sum, l) => sum + l.durationSeconds, 0);
  const canAfford = totalEnergyCost <= currentEnergy;
  const energyShortfall = canAfford ? 0 : totalEnergyCost - currentEnergy;

  return {
    legs,
    totalDistanceLY,
    totalEnergyCost,
    totalDurationSeconds,
    canAfford,
    energyShortfall,
  };
}

// ── Emergency drop ──────────────────────────────────────────────────────

/**
 * Resolve where an emergency drop lands based on hop progress.
 * < 0.5 → origin; ≥ 0.5 → target.
 */
export function resolveEmergencyDropNodeId(
  fromNodeId: string,
  toNodeId: string,
  progressRatio: number
): string {
  return progressRatio < 0.5 ? fromNodeId : toNodeId;
}

// ── Frontier expansion ──────────────────────────────────────────────────

// Deterministic name pool for procedural frontier nodes.
const FRONTIER_NAMES = [
  'Tau Ceti',
  'Luyten 726-8',
  'Gliese 581',
  'Wolf 359',
  "Barnard's Star",
  'Ross 154',
  'Ross 248',
  'Epsilon Indi',
  'Lacaille 9352',
  'Struve 2398',
  'Groombridge 34',
  'Luyten b',
  "Kapteyn's Star",
  'Lalande 21185',
  'DX Cancri',
];

/** Simple deterministic RNG seeded from a string + optional extra seed. */
function createSeededRng(seedStr: string, extraSeed = 7): () => number {
  let state = 0;
  for (let i = 0; i < seedStr.length; i++) {
    state = (state * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  state = (state + extraSeed) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Check if a candidate position respects minimum spacing from all existing nodes. */
function isValidPosition(
  candidate: { x: number; y: number },
  existing: readonly StarNode[],
  minSpacing: number
): boolean {
  for (const n of existing) {
    const d = Math.hypot(candidate.x - n.x, candidate.y - n.y);
    if (d < minSpacing) return false;
  }
  return true;
}

/** Generate a deterministic star name not already used. */
function generateStarName(rng: () => number, used: Set<string>): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    const name = FRONTIER_NAMES[Math.floor(rng() * FRONTIER_NAMES.length)];
    if (!used.has(name)) return name;
  }
  // Fallback
  return `System ${Math.floor(rng() * 10000)}`;
}

/**
 * Expand the sector frontier by adding 2 new procedural star nodes
 * near the tapped frontier node. Deterministic from the node id.
 */
export function expandSectorFrontier(
  frontierNodeId: string,
  nodes: Record<string, StarNode>,
  edges: readonly RouteEdge[],
  seed = 7
): FrontierExpansionResult {
  const rng = createSeededRng(frontierNodeId, seed);
  const origin = nodes[frontierNodeId];
  if (!origin) return { nodes, edges, addedNodeIds: [] };

  const existing = Object.values(nodes);
  const usedNames = new Set(existing.map((n) => n.name));
  const minSpacing = GAME_CONSTANTS.MIN_NODE_SPACING_LY;

  const newNodes: StarNode[] = [];
  const newEdges: RouteEdge[] = [];
  const addedIds: string[] = [];

  for (let i = 0; i < GAME_CONSTANTS.FRONTIER_NODES_PER_SCAN; i++) {
    // Random angle and distance from origin (1.5–3.5 LY)
    const angle = rng() * Math.PI * 2;
    const distance = minSpacing * 1.5 + rng() * minSpacing * 2; // 2.25–5.25 LY

    let candidate = {
      x: origin.x + distance * Math.cos(angle),
      y: origin.y + distance * Math.sin(angle),
    };

    // Ensure minimum spacing; if invalid, spiral outwards
    const radius = distance;
    let attempts = 0;
    while (!isValidPosition(candidate, existing.concat(newNodes), minSpacing) && attempts < 24) {
      attempts++;
      const stepAngle = attempts * 0.8;
      const stepRadius = minSpacing * 1.2 * attempts;
      candidate = {
        x: origin.x + (radius + stepRadius) * Math.cos(angle + stepAngle),
        y: origin.y + (radius + stepRadius) * Math.sin(angle + stepAngle),
      };
    }

    const name = generateStarName(rng, usedNames);
    usedNames.add(name);
    const id = `${frontierNodeId}-chart-${i + 1}`;

    const safety: 'Safe' | 'Unsafe' = rng() > 0.65 ? 'Unsafe' : 'Safe';
    const bodyCount = 2 + Math.floor(rng() * 4); // 2–5 bodies

    // Resource hints: pick 2–3 elements from common/uncommon pool
    const hintPool = ['H', 'He', 'C', 'N', 'O', 'Fe', 'Si', 'Mg', 'Al', 'Ti', 'Au', 'Pt'];
    const hints: string[] = [];
    const hintCount = 2 + Math.floor(rng() * 2);
    for (let h = 0; h < hintCount; h++) {
      hints.push(hintPool[Math.floor(rng() * hintPool.length)]);
    }

    const node: StarNode = {
      id,
      name,
      x: candidate.x,
      y: candidate.y,
      isDiscovered: false,
      hasSpaceport: false,
      isFrontier: true,
      safety,
      bodyCount,
      resourceHints: hints,
    };

    const distanceLY =
      Math.round(Math.hypot(candidate.x - origin.x, candidate.y - origin.y) * 10) / 10;
    const edge: RouteEdge = {
      id: `${frontierNodeId}--${id}`,
      sourceId: frontierNodeId,
      targetId: id,
      distanceLY,
    };

    newNodes.push(node);
    newEdges.push(edge);
    addedIds.push(id);
  }

  // Merge into copies
  const mergedNodes = { ...nodes };
  for (const n of newNodes) mergedNodes[n.id] = n;
  const mergedEdges = [...edges, ...newEdges];

  return { nodes: mergedNodes, edges: mergedEdges, addedNodeIds: addedIds };
}
