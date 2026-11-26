import { useCallback, useEffect, useState } from 'react';
import { useCadenceClicker } from './useCadenceClicker';
import {
  StarMapState,
  StarMapAction,
  starMapReducer,
  createInitialState,
  AmbushState,
} from '@/lib/starmapState';
import { buildRouteHops, STARTER_CARGO, START_SYSTEM_ID } from '@/lib/starmap';

function buildInitialState(opts: {
  initialRoute?: readonly string[];
  initialEnergy?: number;
  initialCredits?: number;
  initialPhase?: 'idle' | 'in-transit' | 'arrived';
  initialAmbush?: boolean;
}): Partial<StarMapState> {
  const overrides: Partial<StarMapState> = {};

  if (opts.initialRoute) overrides.route = [...opts.initialRoute];
  if (opts.initialEnergy !== undefined) overrides.energy = opts.initialEnergy;
  if (opts.initialCredits !== undefined) overrides.credits = opts.initialCredits;

  if (opts.initialPhase) {
    overrides.phase = opts.initialPhase;
    const route = overrides.route ?? [START_SYSTEM_ID];

    if (opts.initialPhase === 'in-transit') {
      const hops = buildRouteHops(route);
      overrides.hopIndex = 0;
      overrides.hopRemaining = hops[0]?.travelSeconds ?? 0;
    }

    if (opts.initialPhase === 'arrived') {
      overrides.arrivedAt = route[route.length - 1] ?? null;
    }
  }

  if (opts.initialAmbush) {
    overrides.ambush = {
      active: true,
      resolved: false,
      evaded: false,
      stolen: null,
      cargo: STARTER_CARGO,
    } satisfies AmbushState;
  }

  return overrides;
}

export function useStarMap(
  opts: {
    initialRoute?: readonly string[];
    initialEnergy?: number;
    initialCredits?: number;
    initialPhase?: 'idle' | 'in-transit' | 'arrived';
    initialAmbush?: boolean;
  } = {}
) {
  const [state, setState] = useState<StarMapState>(() =>
    createInitialState(buildInitialState(opts))
  );

  const dispatch = useCallback(
    (action: StarMapAction) => setState((prev) => starMapReducer(prev, action)),
    []
  );

  const {
    route,
    energy,
    credits,
    phase,
    hopIndex,
    hopRemaining,
    droppedAt,
    arrivedAt,
    lastMessage,
    ambush,
  } = state;

  const cadence = useCadenceClicker();
  const hops = buildRouteHops(route);

  const hopTotalEnergy = hops.reduce((sum: number, h) => sum + h.energyCost, 0);
  const hopTotalTime = hops.reduce((sum: number, h) => sum + h.travelSeconds, 0);
  const insufficientEnergy = hopTotalEnergy > energy;

  // Compute cadence-based time-skip seconds
  const computeTimeSkipSeconds = useCallback((): number => {
    const now = Date.now();
    let newCombo = cadence.comboTier;
    if (now - cadence.lastTap > 1000) {
      newCombo = 0;
    } else {
      newCombo = Math.min(cadence.comboTier + 1, 20);
    }
    return newCombo <= 0 ? 1 : Math.floor(Math.pow(1.35, newCombo));
  }, [cadence.comboTier, cadence.lastTap]);

  const engage = useCallback(() => dispatch({ type: 'ENGAGE' }), [dispatch]);
  const clearRoute = useCallback(() => dispatch({ type: 'CLEAR_ROUTE' }), [dispatch]);
  const cancelHop = useCallback(() => dispatch({ type: 'CANCEL_HOP' }), [dispatch]);
  const plotStar = useCallback(
    (starId: string) => dispatch({ type: 'PLOT_STAR', starId }),
    [dispatch]
  );
  const triggerTimeSkip = useCallback(
    (seconds?: number) => {
      if (state.phase !== 'in-transit') return;
      const skip = seconds ?? computeTimeSkipSeconds();
      dispatch({ type: 'TIME_SKIP', seconds: skip });
    },
    [state.phase, dispatch, computeTimeSkipSeconds]
  );
  const triggerAmbush = useCallback(() => dispatch({ type: 'TRIGGER_AMBUSH' }), [dispatch]);
  const resolveAmbush = useCallback(
    (evaded: boolean, stolen?: { symbol: string; name: string; quantity: number }) =>
      dispatch({ type: 'RESOLVE_AMBUSH', evaded, stolen }),
    [dispatch]
  );
  const dismissAmbush = useCallback(() => dispatch({ type: 'DISMISS_AMBUSH' }), [dispatch]);

  // Transit timer effect (1-second interval)
  useEffect(() => {
    if (state.phase !== 'in-transit') return;

    const intervalId = window.setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [state.phase, dispatch]);

  return {
    // State
    route,
    energy,
    credits,
    phase,
    hopIndex,
    hopRemaining,
    droppedAt,
    arrivedAt,
    lastMessage,
    ambush,

    // Actions
    engage,
    clearRoute,
    cancelHop,
    plotStar,
    triggerTimeSkip,
    triggerAmbush,
    resolveAmbush,
    dismissAmbush,

    // Derived
    hops,
    hopTotalEnergy,
    hopTotalTime,
    insufficientEnergy,
    isAmbushActive: ambush.active,
    currentSystem: route[route.length - 1] ?? START_SYSTEM_ID,
    cadence,
    computeTimeSkipSeconds,
  };
}

/** The controller/view-model returned by useStarMap. */
export type StarMapController = ReturnType<typeof useStarMap>;
