import {
  STAR_CLUSTER,
  STARTER_CARGO,
  START_SYSTEM_ID,
  ROUTE_EDGES,
  buildRouteHops,
  findEdgeBetween,
  isPirateHazardSystem,
  type StarNode as StarmapStarNode,
  type RouteEdge as StarmapRouteEdge,
} from './starmap';
import { INITIAL_ENERGY, INITIAL_CREDITS } from './game';
import { GAME_CONSTANTS } from '@/engine/constants';
import { expandSectorFrontier } from '@/engine/routeEngine';
import type { StarNode, RouteEdge } from '@/engine/mapTypes';

/** Cargo slot for pirate-ambush loot. */
export interface CargoSlot {
  symbol: string;
  name: string;
  quantity: number;
}

/** Ambush state kept alongside transit so the map stays interactive. */
export interface AmbushState {
  active: boolean;
  resolved: boolean;
  evaded: boolean;
  stolen: { symbol: string; name: string; quantity: number } | null;
  cargo: readonly CargoSlot[];
}

/** Full map state held in a single useState(updater). */
export interface StarMapState {
  route: string[];
  energy: number;
  credits: number;
  phase: MapPhase;
  hopIndex: number;
  hopRemaining: number;
  droppedAt: string | null;
  arrivedAt: string | null;
  lastMessage: string | null;
  ambush: AmbushState;
  /** Star nodes keyed by id, in engine light-year coordinates. */
  nodes: Record<string, StarNode>;
  /** Hyperlane edges between nodes (engine route-edge shape). */
  edges: readonly RouteEdge[];
}

/** Convert a starmap data node into an engine-map node (light-year coords). */
export function toEngineStarNode(n: StarmapStarNode): StarNode {
  return {
    id: n.id,
    name: n.name,
    x: n.x,
    y: n.y,
    isDiscovered: n.status !== 'unknown',
    hasSpaceport: n.hasSpaceport,
    isFrontier: n.status === 'discovered',
    safety: 'Safe',
    bodyCount: n.bodyCount,
    resourceHints: n.resourceHints,
  };
}

/** Convert a starmap data edge into an engine route edge (distance only). */
export function toEngineRouteEdge(e: StarmapRouteEdge): RouteEdge {
  return {
    id: e.id,
    sourceId: e.sourceId,
    targetId: e.targetId,
    distanceLY: e.distanceLY,
  };
}

/** Build the engine-shaped node map from the seeded cluster. */
export function buildEngineNodes(): Record<string, StarNode> {
  const nodes: Record<string, StarNode> = {};
  for (const n of STAR_CLUSTER) {
    nodes[n.id] = toEngineStarNode(n);
  }
  return nodes;
}

/** Build the engine-shaped edge list from the seeded routes. */
export function buildEngineEdges(): RouteEdge[] {
  return ROUTE_EDGES.map(toEngineRouteEdge);
}

export type MapPhase = 'idle' | 'in-transit' | 'arrived';

export type StarMapAction =
  | { type: 'PLOT_STAR'; starId: string }
  | { type: 'CLEAR_ROUTE' }
  | { type: 'ENGAGE' }
  | { type: 'TICK' }
  | { type: 'TIME_SKIP'; seconds: number }
  | { type: 'CANCEL_HOP' }
  | { type: 'TRIGGER_AMBUSH' }
  | { type: 'TRIGGER_FRONTIER_SCAN'; frontierNodeId: string }
  | {
      type: 'RESOLVE_AMBUSH';
      evaded: boolean;
      stolen?: { symbol: string; name: string; quantity: number };
    }
  | { type: 'DISMISS_AMBUSH' };

/** Initial map state, with optional story overrides. */
export function createInitialState(overrides: Partial<StarMapState> = {}): StarMapState {
  const initial: StarMapState = {
    route: [START_SYSTEM_ID],
    energy: INITIAL_ENERGY,
    credits: INITIAL_CREDITS,
    phase: 'idle',
    hopIndex: 0,
    hopRemaining: 0,
    droppedAt: null,
    arrivedAt: null,
    lastMessage: null,
    ambush: {
      active: false,
      resolved: false,
      evaded: false,
      stolen: null,
      cargo: STARTER_CARGO,
    },
    nodes: buildEngineNodes(),
    edges: buildEngineEdges(),
    ...overrides,
  };
  // Deep-copy node map and edge list so callers cannot mutate shared state.
  return {
    ...initial,
    nodes: { ...initial.nodes },
    edges: [...initial.edges],
  };
}

/** Helper: total energy for a list of hops. */
function hopTotalEnergy(hops: ReturnType<typeof buildRouteHops>): number {
  return hops.reduce((sum, h) => sum + h.energyCost, 0);
}

/** Helper: reset ambush state for a new engagement cycle. */
function resetAmbush(prev: AmbushState): AmbushState {
  return {
    ...prev,
    active: false,
    resolved: false,
    evaded: false,
    stolen: null,
    cargo: prev.cargo,
  };
}

/** Helper: auto-trigger ambush on pirate hazard arrival. */
function withHazardAmbush(state: StarMapState): StarMapState {
  if (!state.arrivedAt || !isPirateHazardSystem(state.arrivedAt)) {
    return state;
  }
  return {
    ...state,
    ambush: { ...state.ambush, active: true },
    lastMessage: `Pirate ambush at ${state.arrivedAt}!`,
  };
}

/** Handler: plot star / extend route / tail-sever. */
function handlePlotStar(state: StarMapState, starId: string): StarMapState {
  if (state.phase !== 'idle') return state;

  const node = STAR_CLUSTER.find((n) => n.id === starId);
  if (!node) return state;

  if (state.route.length === 0) {
    const edge = findEdgeBetween(START_SYSTEM_ID, starId);
    if (!edge) return state;
    return {
      ...state,
      route: [START_SYSTEM_ID, starId],
      droppedAt: null,
      arrivedAt: null,
      lastMessage: null,
      ambush: resetAmbush(state.ambush),
    };
  }

  const last = state.route[state.route.length - 1];
  const idx = state.route.indexOf(starId);

  if (idx >= 0) {
    // Tail-severing: keep prefix through this star
    return {
      ...state,
      route: state.route.slice(0, idx + 1),
      droppedAt: null,
      arrivedAt: null,
      lastMessage: null,
      ambush: resetAmbush(state.ambush),
    };
  }

  const edge = findEdgeBetween(last, starId);
  if (!edge) return state;

  return {
    ...state,
    route: [...state.route, starId],
    droppedAt: null,
    arrivedAt: null,
    lastMessage: null,
    ambush: resetAmbush(state.ambush),
  };
}

/** Handler: clear route back to Sol. */
function handleClearRoute(state: StarMapState): StarMapState {
  return {
    ...createInitialState(),
    route: [START_SYSTEM_ID],
    ambush: state.ambush,
  };
}

/** Handler: engage warp on plotted route if energy is sufficient. */
function handleEngage(state: StarMapState): StarMapState {
  const hops = buildRouteHops(state.route);
  if (hops.length === 0) return state;

  const totalEnergy = hopTotalEnergy(hops);
  if (totalEnergy > state.energy) {
    return { ...state, lastMessage: 'Insufficient Energy' };
  }

  return {
    ...state,
    phase: 'in-transit',
    hopIndex: 0,
    hopRemaining: hops[0].travelSeconds,
    droppedAt: null,
    arrivedAt: null,
    lastMessage: null,
    ambush: resetAmbush(state.ambush),
  };
}

/** Handler: advance the transit clock by one second. */
function handleTick(state: StarMapState): StarMapState {
  if (state.phase !== 'in-transit') return state;

  const hops = buildRouteHops(state.route);
  const hop = hops[state.hopIndex];
  if (!hop) {
    const arrivedAt = state.route[state.route.length - 1] ?? 'unknown';
    return withHazardAmbush({
      ...state,
      phase: 'arrived',
      hopIndex: 0,
      hopRemaining: 0,
      arrivedAt,
      lastMessage: `Arrived at ${arrivedAt}`,
      droppedAt: null,
      ambush: resetAmbush(state.ambush),
    });
  }

  const newRemaining = state.hopRemaining - 1;
  if (newRemaining > 0) {
    return {
      ...state,
      hopRemaining: newRemaining,
      lastMessage: null,
      droppedAt: null,
      arrivedAt: null,
      ambush: resetAmbush(state.ambush),
    };
  }

  const reachedDestination = state.hopIndex >= hops.length - 1;
  const nextHop = hops[state.hopIndex + 1];

  if (reachedDestination) {
    const arrivedAt = state.route[state.route.length - 1] ?? 'unknown';
    return withHazardAmbush({
      ...state,
      phase: 'arrived',
      hopIndex: state.hopIndex,
      hopRemaining: 0,
      arrivedAt,
      lastMessage: `Arrived at ${arrivedAt}`,
      droppedAt: null,
      ambush: resetAmbush(state.ambush),
    });
  }

  return {
    ...state,
    phase: 'in-transit',
    hopIndex: state.hopIndex + 1,
    hopRemaining: nextHop ? nextHop.travelSeconds : 0,
    lastMessage: null,
    droppedAt: null,
    arrivedAt: null,
    ambush: resetAmbush(state.ambush),
  };
}

/** Handler: apply an exponential time-skip to the current hop. */
function handleTimeSkip(state: StarMapState, seconds: number): StarMapState {
  if (state.phase !== 'in-transit') return state;
  if (!seconds || seconds <= 0) return state;

  const hops = buildRouteHops(state.route);
  const hop = hops[state.hopIndex];
  if (!hop) return state;

  const newRemaining = state.hopRemaining - seconds;
  if (newRemaining > 0) {
    return {
      ...state,
      hopRemaining: newRemaining,
      lastMessage: null,
      droppedAt: null,
      arrivedAt: null,
      ambush: resetAmbush(state.ambush),
    };
  }

  const reachedDestination = state.hopIndex >= hops.length - 1;
  const nextHop = hops[state.hopIndex + 1];

  if (reachedDestination) {
    const arrivedAt = state.route[state.route.length - 1] ?? 'unknown';
    return withHazardAmbush({
      ...state,
      phase: 'arrived',
      hopIndex: state.hopIndex,
      hopRemaining: 0,
      arrivedAt,
      lastMessage: `Arrived at ${arrivedAt}`,
      droppedAt: null,
      ambush: resetAmbush(state.ambush),
    });
  }

  return {
    ...state,
    phase: 'in-transit',
    hopIndex: state.hopIndex + 1,
    hopRemaining: nextHop ? nextHop.travelSeconds : 0,
    lastMessage: null,
    droppedAt: null,
    arrivedAt: null,
    ambush: resetAmbush(state.ambush),
  };
}

/** Handler: cancel hop at nearest node. */
function handleCancelHop(state: StarMapState): StarMapState {
  if (state.phase !== 'in-transit') return state;

  const hops = buildRouteHops(state.route);
  const hop = hops[state.hopIndex];
  if (!hop) return state;

  const total = hop.travelSeconds;
  const progress = total > 0 ? (total - state.hopRemaining) / total : 1;
  const dropToDest = progress >= 0.5;

  const dropId = dropToDest ? hop.toId : hop.fromId;
  const dropIndex = dropToDest ? state.hopIndex + 1 : state.hopIndex;

  const newRoute = state.route.slice(0, dropIndex + 1);
  const newEnergy = Math.max(0, state.energy - hop.energyCost);

  return {
    ...state,
    route: newRoute,
    energy: newEnergy,
    phase: 'idle',
    hopIndex: 0,
    hopRemaining: 0,
    droppedAt: dropId,
    arrivedAt: null,
    lastMessage: `Dropped at ${dropId}`,
    ambush: resetAmbush(state.ambush),
  };
}

/** Handler: trigger a new pirate ambush. */
function handleTriggerAmbush(state: StarMapState): StarMapState {
  return {
    ...state,
    ambush: {
      ...state.ambush,
      active: true,
      resolved: false,
      evaded: false,
      stolen: null,
      cargo: state.ambush.cargo,
    },
  };
}

/** Handler: chart a frontier system — validate, deduct energy, expand sector. */
function handleTriggerFrontierScan(state: StarMapState, frontierNodeId: string): StarMapState {
  const node = state.nodes[frontierNodeId];
  if (!node) {
    return { ...state, lastMessage: 'Unknown system — cannot scan.' };
  }
  if (!node.isFrontier) {
    return { ...state, lastMessage: `${node.name} is not a frontier system.` };
  }
  if (state.energy < GAME_CONSTANTS.FRONTIER_SCAN_ENERGY_COST) {
    return {
      ...state,
      lastMessage: `Insufficient energy: need ${GAME_CONSTANTS.FRONTIER_SCAN_ENERGY_COST} EN to chart.`,
    };
  }

  const newEnergy = state.energy - GAME_CONSTANTS.FRONTIER_SCAN_ENERGY_COST;
  const seed = Date.now() % 100000;
  const expansion = expandSectorFrontier(frontierNodeId, state.nodes, state.edges, seed);

  const names = expansion.addedNodeIds.map((id) => expansion.nodes[id]?.name ?? id).join(', ');

  return {
    ...state,
    energy: newEnergy,
    nodes: expansion.nodes,
    edges: expansion.edges,
    lastMessage: `Sector charted: ${names}.`,
  };
}

/** Handler: resolve pirate ambush outcome and apply loot/cargo change. */
function handleResolveAmbush(
  state: StarMapState,
  evaded: boolean,
  stolen?: { symbol: string; name: string; quantity: number }
): StarMapState {
  const newAmbush: AmbushState = {
    ...state.ambush,
    resolved: true,
    evaded,
  };

  if (evaded) {
    newAmbush.stolen = null;
  } else if (stolen) {
    newAmbush.stolen = stolen;
  } else {
    newAmbush.stolen = null;
  }

  return {
    ...state,
    ambush: newAmbush,
    lastMessage: evaded
      ? 'Evaded pirate ambush with 0 loss!'
      : `Cargo stolen: ${stolen?.name ?? stolen?.symbol} (${stolen?.quantity ?? 0})`,
    droppedAt: null,
    arrivedAt: null,
  };
}

/** Handler: dismiss the current ambush. */
function handleDismissAmbush(state: StarMapState): StarMapState {
  return {
    ...state,
    ambush: resetAmbush(state.ambush),
    lastMessage: null,
    droppedAt: null,
    arrivedAt: null,
  };
}

/** Thin dispatch table for the star map reducer. */
export function starMapReducer(state: StarMapState, action: StarMapAction): StarMapState {
  switch (action.type) {
    case 'PLOT_STAR':
      return handlePlotStar(state, action.starId);
    case 'CLEAR_ROUTE':
      return handleClearRoute(state);
    case 'ENGAGE':
      return handleEngage(state);
    case 'TICK':
      return handleTick(state);
    case 'TIME_SKIP':
      return handleTimeSkip(state, action.seconds);
    case 'CANCEL_HOP':
      return handleCancelHop(state);
    case 'TRIGGER_AMBUSH':
      return handleTriggerAmbush(state);
    case 'TRIGGER_FRONTIER_SCAN':
      return handleTriggerFrontierScan(state, action.frontierNodeId);
    case 'RESOLVE_AMBUSH':
      return handleResolveAmbush(state, action.evaded, action.stolen);
    case 'DISMISS_AMBUSH':
      return handleDismissAmbush(state);
    default:
      return state;
  }
}
