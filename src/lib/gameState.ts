/**
 * Pure game state model for the Space Exploration PWA.
 *
 * This layer knows nothing about React or the DOM. It defines the game's
 * state shape, a pure reducer, and selectors. UI components drive state only
 * by dispatching actions through the `useGame` hook.
 */
import { type PeriodicElement } from './elements';
import { calculateWarpEnergyCost } from './game';

// ── Constants ─────────────────────────────────────────────────────────────
// Energy cap kept in sync with the current App shell behavior (1000).
export const MAX_ENERGY = 1000;
export const CODEX_TOTAL = 118;

// ── State ─────────────────────────────────────────────────────────────────
export interface CargoSlot {
  symbol: string;
  quantity: number;
}

export interface GameState {
  credits: number;
  energy: number;
  cargoHold: CargoSlot[];
  discoveredElements: Set<number>;
}

export const initialGameState: GameState = {
  credits: 0,
  energy: MAX_ENERGY,
  cargoHold: [],
  discoveredElements: new Set(),
};

// ── Actions ───────────────────────────────────────────────────────────────
export type GameAction =
  | { type: 'GAME/MINE'; payload: { element: PeriodicElement } }
  | { type: 'GAME/RECHARGE'; payload: { amount: number } }
  | { type: 'GAME/SET_ENERGY'; payload: { amount: number } }
  | { type: 'GAME/RESET' };

// ── Reducer (pure) ────────────────────────────────────────────────────────
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'GAME/MINE': {
      const { element } = action.payload;
      const cost = calculateWarpEnergyCost(1);
      // Guard: refuse to mine when there isn't enough energy.
      if (state.energy < cost) return state;

      const creditsGained = Math.floor(element.baselineValue * 0.5);

      const newCargo = [...state.cargoHold];
      const existing = newCargo.findIndex((s) => s.symbol === element.symbol);
      if (existing >= 0) {
        newCargo[existing] = {
          ...newCargo[existing],
          quantity: newCargo[existing].quantity + 1,
        };
      } else {
        newCargo.push({ symbol: element.symbol, quantity: 1 });
      }

      const newDiscovered = new Set(state.discoveredElements);
      newDiscovered.add(element.atomicNumber);

      return {
        ...state,
        credits: state.credits + creditsGained,
        energy: state.energy - cost,
        cargoHold: newCargo,
        discoveredElements: newDiscovered,
      };
    }

    case 'GAME/RECHARGE': {
      return {
        ...state,
        energy: Math.min(MAX_ENERGY, state.energy + action.payload.amount),
      };
    }

    case 'GAME/SET_ENERGY': {
      return {
        ...state,
        energy: Math.max(0, Math.min(MAX_ENERGY, action.payload.amount)),
      };
    }

    case 'GAME/RESET': {
      return {
        ...initialGameState,
        discoveredElements: new Set(initialGameState.discoveredElements),
      };
    }

    default: {
      return state;
    }
  }
}

// ── Selectors ─────────────────────────────────────────────────────────────
export function selectTotalCargoUnits(state: GameState): number {
  return state.cargoHold.reduce((sum, slot) => sum + slot.quantity, 0);
}

export function selectCargoSlot(state: GameState, symbol: string): CargoSlot | undefined {
  return state.cargoHold.find((s) => s.symbol === symbol);
}

export function selectIsElementDiscovered(state: GameState, atomicNumber: number): boolean {
  return state.discoveredElements.has(atomicNumber);
}

export function selectCodexProgress(state: GameState) {
  const discovered = state.discoveredElements.size;
  return {
    discovered,
    total: CODEX_TOTAL,
    complete: discovered >= CODEX_TOTAL,
  };
}

export function selectCanMine(state: GameState, _element: PeriodicElement): boolean {
  return state.energy >= calculateWarpEnergyCost(1);
}
