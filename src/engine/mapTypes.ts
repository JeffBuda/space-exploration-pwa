/**
 * Map-related type definitions for the Star Map and Anchored Route Engine.
 * Pure TypeScript — no React dependencies.
 */

/** Interaction mode of the Star Map. */
export type MapInteractionMode = 'edit_route' | 'info';

/** A star system node on the map. */
export interface StarNode {
  id: string;
  name: string;
  /** Position in light-years from the sector origin (Sol). */
  x: number;
  y: number;
  isDiscovered: boolean;
  hasSpaceport: boolean;
  isFrontier: boolean;
  safety: 'Safe' | 'Unsafe';
  bodyCount: number;
  resourceHints: string[];
}

/** A hyperlane edge between two star systems. */
export interface RouteEdge {
  id: string;
  sourceId: string;
  targetId: string;
  distanceLY: number;
}

/** Viewport transform for pan/zoom state. */
export interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

/** A single leg of an anchored route. */
export interface RouteLeg {
  legIndex: number;
  fromNodeId: string;
  toNodeId: string;
  toNodeName: string;
  distanceLY: number;
  energyCost: number;
  durationSeconds: number;
}

/** Aggregated route summary used by the RouteTab drawer. */
export interface RouteSummary {
  legs: RouteLeg[];
  totalDistanceLY: number;
  totalEnergyCost: number;
  totalDurationSeconds: number;
  canAfford: boolean;
  energyShortfall: number;
}

/** Result of a node tap in edit-route mode. */
export interface EditModeSelectionResult {
  activeRoute: string[];
  error: string | null;
}

/** Active in-transit visual representation for the map. */
export interface ActiveTransitVisual {
  fromNodeId: string;
  toNodeId: string;
  progressRatio: number; // 0.0 to 1.0
}

/** Result of a frontier scan expansion. */
export interface FrontierExpansionResult {
  nodes: Record<string, StarNode>;
  edges: readonly RouteEdge[];
  addedNodeIds: string[];
}

/** Cargo slot for periodic table elements (used by pirate ambush). */
export interface CargoSlot {
  symbol: string;
  quantity: number;
}
