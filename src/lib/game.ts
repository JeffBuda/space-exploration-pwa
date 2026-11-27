/**
 * Game constants, types, and utilities for the Space Exploration PWA.
 * Strictly models the finalized game specification.
 */
import { ELEMENTS, type PeriodicElement, type ElementRarity } from './elements';

// ── Rarity visual helpers ────────────────────────────────────────────────
export const RARITY_COLORS: Record<ElementRarity, string> = {
  common: 'text-rarity-common',
  uncommon: 'text-secondary-foreground',
  rare: 'text-warning',
  epic: 'text-rarity-epic',
  legendary: 'text-rarity-legendary',
};

export const RARITY_BG: Record<ElementRarity, string> = {
  common: 'bg-background/30 border-border/50',
  uncommon: 'bg-secondary/30 border-secondary/50',
  rare: 'bg-warning-bg/30 border-warning/50',
  epic: 'bg-rarity-epic/30 border-rarity-epic/50',
  legendary: 'bg-rarity-legendary/30 border-rarity-legendary/50',
};

export const RARITY_RING: Record<ElementRarity, string> = {
  common: 'ring-rarity-common',
  uncommon: 'ring-rarity-uncommon',
  rare: 'ring-rarity-rare',
  epic: 'ring-rarity-epic',
  legendary: 'ring-rarity-legendary',
};

export function formatCredits(credits: number): string {
  return Math.floor(credits).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm > 0 ? `${h}h ${mm}m` : `${h}h`;
}

export function formatTimeHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatTimeDHMS(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ── Game constants ──────────────────────────────────────────────────────
// Sol starter state ("New Run"): Sol pre-scanned, guaranteed safe starter
// planets/moons, guaranteed Spaceport, 100 CR (integer), 100/100 EN,
// 1.0 EN/min passive solar regeneration (uncapped offline).
export const INITIAL_CREDITS = 100;
export const INITIAL_ENERGY = 100;
export const MAX_ENERGY = 100;
export const ENERGY_REGEN_PER_MINUTE = 1; // 1.0 EN/min passive solar regen (no offline cap)
export const SPACEPORT_CHANCE = 0.1; // ~10% of safe systems have a Spaceport

// Energy cost per light-year (simple linear scaling)
export function calculateWarpEnergyCost(distanceLy: number): number {
  return Math.ceil(distanceLy * 10);
}

export function calculateTravelTimeSeconds(distanceLy: number): number {
  // 1 LY = 30 seconds base travel time
  return Math.ceil(distanceLy * 30);
}

// ── Element helpers ──────────────────────────────────────────────────────
export function getElementBySymbol(symbol: string): PeriodicElement | undefined {
  return ELEMENTS.find((e) => e.symbol === symbol);
}

export function getElementByAtomicNumber(atomicNumber: number): PeriodicElement | undefined {
  return ELEMENTS.find((e) => e.atomicNumber === atomicNumber);
}

export function getElementsByRarity(rarity: ElementRarity): PeriodicElement[] {
  return ELEMENTS.filter((e) => e.rarity === rarity);
}

// ── Star system generation (deterministic from seed) ────────────────────
export interface StarSystem {
  id: string;
  name: string;
  x: number;
  y: number;
  tier: 1 | 2 | 3;
  bodies: CelestialBody[];
  hasSpaceport: boolean;
  spaceportPrices: Record<string, { bid: number; ask: number }>;
  discovered: boolean;
}

export interface CelestialBody {
  id: string;
  name: string;
  type: 'star' | 'planet' | 'moon';
  safety: 'safe' | 'unsafe';
  preScanHints: string[]; // element symbols likely minable here
  scanned: boolean;
  minableElements: { symbol: string; extractionDuration: number }[];
  landingDuration: number; // seconds
}

export function generateStarSystems(seed: number, count: number = 50): StarSystem[] {
  const systems: StarSystem[] = [];
  let rngState = seed;

  function nextRandom(): number {
    rngState = (rngState * 1664525 + 1013904223) % 4294967296;
    return rngState / 4294967296;
  }

  function pickWeighted<T>(items: T[], weightFn: (item: T) => number): T {
    const totalWeight = items.reduce((sum, item) => sum + weightFn(item), 0);
    let r = nextRandom() * totalWeight;
    for (const item of items) {
      r -= weightFn(item);
      if (r <= 0) return item;
    }
    return items[items.length - 1];
  }

  // Seed the starting system (Sol)
  const sol: StarSystem = {
    id: 'sol',
    name: 'Sol',
    x: 195,
    y: 422,
    tier: 1,
    bodies: [
      {
        id: 'sol-star',
        name: 'Sol',
        type: 'star',
        safety: 'safe',
        preScanHints: ['H', 'He', 'C', 'N', 'O'],
        scanned: true,
        minableElements: [],
        landingDuration: 0,
      },
      {
        id: 'mercury',
        name: 'Mercury',
        type: 'planet',
        safety: 'unsafe',
        preScanHints: ['Fe', 'Si', 'Mg'],
        scanned: false,
        minableElements: [],
        landingDuration: 30,
      },
      {
        id: 'venus',
        name: 'Venus',
        type: 'planet',
        safety: 'unsafe',
        preScanHints: ['C', 'S', 'Fe'],
        scanned: false,
        minableElements: [],
        landingDuration: 45,
      },
      {
        id: 'earth',
        name: 'Earth',
        type: 'planet',
        safety: 'safe',
        preScanHints: ['H', 'O', 'Fe', 'Si', 'Al'],
        scanned: false,
        minableElements: [],
        landingDuration: 20,
      },
      {
        id: 'moon',
        name: 'Moon',
        type: 'moon',
        safety: 'safe',
        preScanHints: ['Si', 'Fe', 'Al', 'Ca', 'Ti'],
        scanned: false,
        minableElements: [],
        landingDuration: 10,
      },
      {
        id: 'mars',
        name: 'Mars',
        type: 'planet',
        safety: 'safe',
        preScanHints: ['Fe', 'Si', 'Mg', 'Al', 'Ca'],
        scanned: false,
        minableElements: [],
        landingDuration: 20,
      },
    ],
    hasSpaceport: true,
    spaceportPrices: {},
    discovered: true,
  };

  // Generate spaceport prices for Sol (static from seed)
  sol.spaceportPrices = generateSpaceportPrices(nextRandom);
  systems.push(sol);

  // Generate additional systems
  for (let i = 1; i < count; i++) {
    const tier = pickWeighted([1, 2, 3] as const, (t) => (t === 1 ? 0.4 : t === 2 ? 0.35 : 0.25));
    const x = Math.floor(nextRandom() * 350) + 20;
    const y = Math.floor(nextRandom() * 700) + 70;

    const bodyCount = 3 + Math.floor(nextRandom() * 4); // 3-6 bodies
    const bodies: CelestialBody[] = [];
    let hasSafeBody = false;

    // Add a star
    bodies.push({
      id: `sys${i}-star`,
      name: `Star ${i}`,
      type: 'star',
      safety: 'safe',
      preScanHints: ['H', 'He'],
      scanned: false,
      minableElements: [],
      landingDuration: 0,
    });
    hasSafeBody = true;

    for (let b = 1; b < bodyCount; b++) {
      const isMoon = nextRandom() < 0.3;
      const bodyType = isMoon ? 'moon' : 'planet';
      const safety = nextRandom() < 0.7 ? 'safe' : 'unsafe';
      if (safety === 'safe') hasSafeBody = true;
      const hintCount = 2 + Math.floor(nextRandom() * 3); // 2-4 hints
      const hints: string[] = [];
      for (let h = 0; h < hintCount; h++) {
        const el = pickWeighted(ELEMENTS, (e) =>
          e.rarity === 'common'
            ? 5
            : e.rarity === 'uncommon'
              ? 3
              : e.rarity === 'rare'
                ? 2
                : e.rarity === 'epic'
                  ? 1
                  : 0.5
        );
        hints.push(el.symbol);
      }
      const minableCount = safety === 'safe' ? 1 + Math.floor(nextRandom() * 3) : 0;
      const minable: { symbol: string; extractionDuration: number }[] = [];
      for (let m = 0; m < minableCount; m++) {
        const el = pickWeighted(
          ELEMENTS.filter((e) => e.rarity !== 'legendary'),
          (e) =>
            e.rarity === 'common' ? 5 : e.rarity === 'uncommon' ? 3 : e.rarity === 'rare' ? 2 : 1
        );
        minable.push({ symbol: el.symbol, extractionDuration: el.extractionDuration });
      }

      bodies.push({
        id: `sys${i}-body${b}`,
        name: isMoon ? `Moon ${b}` : `Planet ${b}`,
        type: bodyType,
        safety,
        preScanHints: hints,
        scanned: false,
        minableElements: minable,
        landingDuration: 10 + Math.floor(nextRandom() * 50),
      });
    }

    const hasSpaceport = hasSafeBody && nextRandom() < SPACEPORT_CHANCE;

    systems.push({
      id: `sys${i}`,
      name: `System ${i}`,
      x,
      y,
      tier,
      bodies,
      hasSpaceport,
      spaceportPrices: hasSpaceport ? generateSpaceportPrices(nextRandom) : {},
      discovered: false,
    });
  }

  return systems;
}

function generateSpaceportPrices(rng: () => number): Record<string, { bid: number; ask: number }> {
  const prices: Record<string, { bid: number; ask: number }> = {};
  // Pick ~20 elements for this spaceport
  const selected = [...ELEMENTS].sort(() => rng() - 0.5).slice(0, 20);
  for (const el of selected) {
    const base = el.baselineValue;
    const spread = Math.max(1, Math.floor(base * 0.1));
    const bid = Math.max(1, base - Math.floor(rng() * spread * 2) - spread);
    const ask = base + Math.floor(rng() * spread * 2) + spread;
    prices[el.symbol] = { bid, ask };
  }
  return prices;
}

// ── Prestige tracking ────────────────────────────────────────────────────
export interface PrestigeStats {
  systemsDiscovered: number;
  planetsDiscovered: number;
  totalMined: number; // total units of all elements mined
}

export const INITIAL_PRESTIGE: PrestigeStats = {
  systemsDiscovered: 0,
  planetsDiscovered: 0,
  totalMined: 0,
};

// ── Codex tracking ───────────────────────────────────────────────────────
export interface CodexState {
  discoveredElements: Set<number>; // atomic numbers
  completed: boolean;
}

export const INITIAL_CODEX: CodexState = {
  discoveredElements: new Set(),
  completed: false,
};

export function markElementDiscovered(codex: CodexState, atomicNumber: number): CodexState {
  const newSet = new Set(codex.discoveredElements);
  newSet.add(atomicNumber);
  return { ...codex, discoveredElements: newSet, completed: newSet.size >= 118 };
}

// ── Exponential Time-Skip Clicker ───────────────────────────────────────
export interface TimeSkipState {
  comboTier: number;
  lastTap: number;
  decayTimer: number | null;
}

export const INITIAL_TIME_SKIP: TimeSkipState = {
  comboTier: 0,
  lastTap: 0,
  decayTimer: null,
};

export function calculateTimeSkipAmount(comboTier: number): number {
  // Starts at -1s per click, scales exponentially: floor(1.35^comboTier)
  if (comboTier <= 0) return -1;
  return Math.floor(Math.pow(1.35, comboTier));
}

export function processTimeSkipTap(state: TimeSkipState, now: number): TimeSkipState {
  const timeSinceLastTap = now - state.lastTap;
  let newComboTier = state.comboTier;

  // Decay combo if paused > 1 second
  if (timeSinceLastTap > 1000) {
    newComboTier = 0;
  } else {
    newComboTier = Math.min(state.comboTier + 1, 20); // cap at tier 20
  }

  return {
    comboTier: newComboTier,
    lastTap: now,
    decayTimer: null,
  };
}

// ── Route types ──────────────────────────────────────────────────────────
export interface RouteHop {
  fromSystemId: string;
  toSystemId: string;
  distanceLy: number;
  energyCost: number;
  travelTimeSeconds: number;
}

export interface ActiveRoute {
  hops: RouteHop[];
  currentHopIndex: number;
  currentHopRemainingSeconds: number;
  isActive: boolean;
}

export function calculateRouteMetrics(hops: RouteHop[]): {
  totalEnergy: number;
  totalTime: number;
} {
  return hops.reduce(
    (acc, hop) => ({
      totalEnergy: acc.totalEnergy + hop.energyCost,
      totalTime: acc.totalTime + hop.travelTimeSeconds,
    }),
    { totalEnergy: 0, totalTime: 0 }
  );
}
