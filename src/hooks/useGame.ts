import { useCallback, useReducer } from 'react';
import { gameReducer, initialGameState, type GameState, type GameAction } from '@/lib/gameState';
import { type PeriodicElement } from '@/lib/elements';

/**
 * React binding for the pure game state model.
 *
 * Components must not call `setState` on game data directly. They read `state`
 * and dispatch through the bound action creators below, which keeps game
 * logic in the reducer and UI logic in components.
 */
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const mineElement = useCallback(
    (element: PeriodicElement) => dispatch({ type: 'GAME/MINE', payload: { element } }),
    []
  );

  const rechargeEnergy = useCallback(
    (amount: number) => dispatch({ type: 'GAME/RECHARGE', payload: { amount } }),
    []
  );

  const setEnergy = useCallback(
    (amount: number) => dispatch({ type: 'GAME/SET_ENERGY', payload: { amount } }),
    []
  );

  const reset = useCallback(() => dispatch({ type: 'GAME/RESET' }), []);

  return { state, mineElement, rechargeEnergy, setEnergy, reset };
}

export type { GameState, GameAction };
export type { CargoSlot } from '@/lib/gameState';
