import type { Meta, StoryObj } from '@storybook/react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Cross, Command, Zap } from 'lucide-react';
import {
  calculateWarpEnergyCost,
  calculateTravelTimeSeconds,
  formatDuration,
} from '@/lib/game';
import { ELEMENTS } from '@/lib/elements';

// ── Mock systems for StarMap demo ─────────────────────────────────────────
const SYSTEMS = [
  { id: 'sol', name: 'Sol', x: 195, y: 422, tier: 1 },
  { id: 'proxima', name: 'Proxima Centauri', x: 140, y: 300, tier: 1 },
  { id: 'epsilon', name: 'Epsilon Eridani', x: 260, y: 220, tier: 1 },
  { id: 'kepler', name: 'Kepler-186', x: 100, y: 520, tier: 2 },
  { id: 'cygnus', name: 'Cygnus-X', x: 330, y: 620, tier: 3 },
];

const EDGES = [
  { from: 'sol', to: 'proxima', distance: 4.2 },
  { from: 'proxima', to: 'epsilon', distance: 2.5 },
  { from: 'epsilon', to: 'kepler', distance: 8.0 },
  { from: 'kepler', to: 'cygnus', distance: 15.0 },
];

interface StarStatus {
  color: string;
  bg: string;
}

interface RouteHop {
  from: string;
  to: string;
  distanceLy: number;
  energy: number;
  time: number;
}

interface StarMapCanvasProps {
  mode: 'default' | 'single-hop' | 'multi-hop' | 'insufficient-energy' | 'in-transit';
  selectedStar?: string;
  route?: string[];
  transit?: boolean;
  credits?: number;
  energy?: number;
}

const StarMapCanvas = ({
  mode,
  selectedStar: initialSelectedStar,
  route: initialRoute = [],
  transit: initialTransit = false,
  credits = 100,
  energy = 100,
}: StarMapCanvasProps) => {
  // Local mutable state for interactivity
  const [selectedStar, setSelectedStar] = useState<string | undefined>(
    initialSelectedStar
  );
  const [route, setRoute] = useState<string[]>(initialRoute);
  const [transit, setTransit] = useState(initialTransit);
  const [expandedRoute, setExpandedRoute] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [timerId, setTimerId] = useState<number | null>(null);
  const [timeSkipCombo, setTimeSkipCombo] = useState(0);
  const [lastTimeSkipTap, setLastTimeSkipTap] = useState(0);
  const [currentHopIndex, setCurrentHopIndex] = useState(0);
  const [energyState, setEnergyState] = useState(energy);
  const [droppedAt, setDroppedAt] = useState<string | null>(null);
  const [arrivedAt, setArrivedAt] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Build hops from route (memoized)
  const hops = useMemo(() => {
    const hopList: Array<{
      from: string;
      to: string;
      distance: number;
      energy: number;
      time: number;
    }> = [];
    for (let i = 0; i < route.length - 1; i++) {
      const edge = EDGES.find(
        (e) =>
          (e.from === route[i] && e.to === route[i + 1]) ||
          (e.from === route[i + 1] && e.to === route[i])
      );
      if (edge) {
        hopList.push({
          from: edge.from,
          to: edge.to,
          distance: edge.distance,
          energy: calculateWarpEnergyCost(edge.distance),
          time: calculateTravelTimeSeconds(edge.distance),
        });
      }
    }
    return hopList;
  }, [route]);

  const totalEnergy = hops.reduce(
    (acc, h) => acc + h.energy,
    0
  );
  const totalTime = hops.reduce(
    (acc, h) => acc + h.time,
    0
  );

  const insufficientEnergy = totalEnergy > energyState;

  // Star status colors (references local route state)
  const starStatus = (id: string): StarStatus => {
    if (id === 'sol') return { color: 'text-green-400', bg: 'bg-green-400/20' };
    if (route.includes(id)) return { color: 'text-cyan-400', bg: 'bg-cyan-400/20' };
    const s = SYSTEMS.find((x) => x.id === id);
    if (!s) return { color: 'text-cyan-500/40', bg: 'bg-cyan-900/10' };
    if (s.tier === 1) return { color: 'text-cyan-300', bg: 'bg-cyan-900/30' };
    if (s.tier === 2) return { color: 'text-cyan-200/60', bg: 'bg-cyan-900/20' };
    return { color: 'text-cyan-500/30', bg: 'bg-cyan-900/10' };
  };
  const getStarStatus = starStatus;

  // Star click handler: route plotting with tail-severing
  const handleStarClick = (starId: string) => {
    if (transit) return;

    // Star is already in route? Sever tail
    const existingIdx = route.indexOf(starId);
    if (existingIdx >= 0) {
      // Keep up to and including this star, drop downstream
      setRoute(route.slice(0, existingIdx + 1));
      setSelectedStar(starId);
      return;
    }

    // Cannot select if no route yet and star is not Sol (route must start at Sol)
    if (route.length === 0 && starId !== 'sol') return;

    // Cannot select if star is already the last in route
    if (route.length > 0 && route[route.length - 1] === starId) return;

    // Find if there's a direct edge from last route star to this star
    if (route.length > 0) {
      const lastStar = route[route.length - 1];
      const edgeExists = EDGES.some(
        (e) => (e.from === lastStar && e.to === starId) || (e.from === starId && e.to === lastStar)
      );
      if (!edgeExists) return;
    }

    // Add star to route
    setRoute([...route, starId]);
    setSelectedStar(starId);
  };

  // Clear route
  const handleClearRoute = () => {
    setRoute([]);
    setSelectedStar(undefined);
    setEnergyState(energy);
    setDroppedAt(null);
    setArrivedAt(null);
  };

  // Engage Warp
  const handleEngageWarp = () => {
    if (insufficientEnergy || route.length < 2) return;
    setTransit(true);
    setCurrentHopIndex(0);
    // Initialize remainingSeconds at 40% through the first hop so
    // Cancel Hop demonstrates dropping at nearest *ahead* node (proxima),
    // not origin (sol). This matches the spec: "drop at nearest star node
    // (consuming the initiated hop's Energy)—not teleporting back to origin".
    const firstHop = hops[currentHopIndex];
    setRemainingSeconds(firstHop ? Math.max(1, Math.floor(firstHop.time * 0.4)) : 0);
    setDroppedAt(null);
    setArrivedAt(null);
  };

  // Cancel Hop — drop at nearest star node, consuming the initiated hop's Energy
  const handleCancelHop = () => {
    if (!transit) return;
    const hop = hops[currentHopIndex];
    const energyCost = hop?.energy ?? 0;

    // Consume the hop's energy
    setEnergyState((prev) => Math.max(0, prev - energyCost));

    // Determine nearest star node based on progress through the hop
    const hopTotal = hop?.time ?? 1;
    const progress = hopTotal > 0 ? (hopTotal - remainingSeconds) / hopTotal : 1;
    const dropToDest = progress >= 0.5;

    // Drop index in route: currentHopIndex+1 means destination of this hop;
    // currentHopIndex means origin (where we started this hop)
    const dropIndex = dropToDest ? currentHopIndex + 1 : currentHopIndex;

    // Advance route to the drop node (keep Sol through the drop point)
    const newRoute = route.slice(0, dropIndex + 1);
    setRoute(newRoute);
    // Set selected star to the dropped-at body
    const droppedStar = newRoute[newRoute.length - 1];
    setSelectedStar(droppedStar ?? undefined);
    // Reset transit state
    setTransit(false);
    setRemainingSeconds(0);
    setCurrentHopIndex(0);
    setDroppedAt(droppedStar ?? 'unknown');
    setArrivedAt(null);
  };

  // Time-Skip clicker
  const handleTimeSkip = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTimeSkipTap;
    let newCombo = timeSkipCombo;

    if (timeSinceLastTap > 1000) {
      newCombo = 0;
    } else {
      newCombo = Math.min(timeSkipCombo + 1, 20);
    }

    setTimeSkipCombo(newCombo);
    setLastTimeSkipTap(now);

    // Calculate time skip amount: floor(1.35^combo)
    // Starts at -1s per click, scales exponentially with comboTier
    const skipAmount = newCombo <= 0 ? -1 : Math.floor(Math.pow(1.35, newCombo));

    // Apply skip to remaining seconds, clamping within current hop's time
    setRemainingSeconds((prev) => {
      const newRemaining = Math.max(0, prev - Math.abs(skipAmount));
      // If we've skipped past the current hop, advance to next hop
      const hopTime = hops[currentHopIndex]?.time ?? 0;
      if (newRemaining === 0 && currentHopIndex < hops.length - 1) {
        setCurrentHopIndex((c) => c + 1);
        // Reset remaining to next hop's full time
        const nextHopTime = hops[currentHopIndex].time;
        return nextHopTime > 0 ? nextHopTime : 0;
      }
      return newRemaining;
    });
  };

  // Transit timer — decrements remainingSeconds each second; advances hops
  useEffect(() => {
    if (!transit) return;

    const hop = hops[currentHopIndex];
    if (!hop) {
      setTransit(false);
      setArrivedAt(selectedStar ?? 'unknown');
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // This hop complete
          if (currentHopIndex < hops.length - 1) {
            setCurrentHopIndex((i) => i + 1);
            const nextHop = hops[currentHopIndex];
            return nextHop ? Math.max(1, nextHop.time) : 0;
          }
          setTransit(false);
          setArrivedAt(route[route.length - 1] ?? 'unknown');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [transit, currentHopIndex, hops, route]);

  // Initialize remainingSeconds on mount when in-transit
  useEffect(() => {
    if (!initialTransit) return;
    if (hops.length > 0) {
      setRemainingSeconds(Math.max(1, Math.floor(hops[0].time * 0.4)));
    }
  }, [initialTransit, hops]);

  const isRouteValid = route.length > 0 && route[0] === 'sol';

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0d1117]">
      {/* Map canvas */}
      <div ref={canvasRef} className="absolute inset-0 h-full w-full">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="none" stroke="currentColor" stroke-width="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Route edges */}
        {EDGES.map((edge) => {
          const fromStar = SYSTEMS.find((s) => s.id === edge.from);
          const toStar = SYSTEMS.find((s) => s.id === edge.to);
          if (!fromStar || !toStar) return null;

          const isConnected =
            route.includes(edge.from) &&
            route.includes(edge.to) &&
            route.indexOf(edge.from) < route.indexOf(edge.to);

          return (
            <svg
              key={edge.from + '-' + edge.to}
              className="pointer-events-none absolute left-0 top-0 h-full w-full"
            >
              <line
                x1={fromStar.x}
                y1={fromStar.y}
                x2={toStar.x}
                y2={toStar.y}
                stroke={isConnected ? '#22d3ee' : '#334155'}
                strokeWidth={isConnected ? 3 : 1}
                strokeDasharray={isConnected ? 0 : '4'}
                strokeOpacity={isConnected ? 1 : 0.3}
              />
            </svg>
          );
        })}

        {/* Stars */}
        {SYSTEMS.map((star) => {
          const status = getStarStatus(star.id);
          const isSelected = star.id === selectedStar;
          return (
            <button
              key={star.id}
              type="button"
              style={{
                left: `${star.x - 22}px`,
                top: `${star.y - 22}px`,
              }}
              className={cn(
                'absolute flex h-11 w-11 cursor-pointer items-center justify-center transition-all duration-200',
                '-mx-2 -my-2',
                status.color,
                status.bg,
                isSelected ? 'ring-2 ring-cyan-400' : '',
                star.id === 'sol' ? 'animate-pulse ring-2 ring-green-400' : ''
              )}
              onClick={() => handleStarClick(star.id)}
              title={star.name}
            >
              <div className="h-4 w-4 rounded-full bg-current opacity-80" />
              <span
                className={cn(
                  'absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px]',
                  status.color
                )}
              >
                {star.name.split(' ')[0]}
              </span>
            </button>
          );
        })}

        {/* Action drawer */}
        <div className="fixed bottom-4 left-4 right-4 z-20 mx-auto max-w-[422px]">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-2xl shadow-black/30">
            {/* Route summary */}
            <div className="space-y-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400">Active Route</span>
                <span
                  className={cn(
                    'font-mono text-[10px]',
                    isRouteValid ? 'text-cyan-400' : 'text-slate-500'
                  )}
                >
                  {route.length > 0 ? route.join(' → ') : '—'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-2">
                  <p className="mb-1 text-[10px] text-slate-400">Energy Cost</p>
                  <span
                    className={cn(
                      'font-mono text-xs',
                      insufficientEnergy ? 'text-red-400' : 'text-cyan-300'
                    )}
                  >
                    {totalEnergy}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-2">
                  <p className="mb-1 text-[10px] text-slate-400">Travel Time</p>
                  <span className="font-mono text-xs text-cyan-300">
                    {formatDuration(totalTime)}
                  </span>
                </div>
              </div>

              {/* Transit in progress */}
              {transit && remainingSeconds > 0 && (
                <div className="space-y-2 rounded-lg border border-cyan-500/30 bg-cyan-900/20 p-3">
                  <div className="mb-1 flex items-center justify-between text-[10px]">
                    <span className="text-cyan-300">Hop Remaining</span>
                    <span className="font-mono text-cyan-100">
                      {formatDuration(remainingSeconds)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-green-400 transition-all duration-1000"
                      style={{
                        width: `${Math.max(0, ((totalTime - remainingSeconds) / totalTime) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      className="flex-1 rounded-lg border border-red-500/50 py-2 text-sm font-medium text-red-400 hover:bg-red-900/20 active:bg-red-800/30"
                      onClick={handleCancelHop}
                      disabled={remainingSeconds <= 0}
                    >
                      <Cross className="mr-1 h-4 w-4" /> Cancel Hop
                      {droppedAt && (
                        <span className="ml-1 text-[10px] text-red-400">
                          Dropped at {droppedAt}
                        </span>
                      )}
                    </button>
                    <button
                      className="flex-1 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-800 py-2 text-sm font-medium text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform active:scale-95"
                      onClick={handleTimeSkip}
                    >
                      <Zap className="mr-1 h-4 w-4" />
                      Time-Skip
                      <span className="ml-2 font-mono text-xs text-green-300">
                        {timeSkipCombo <= 0 ? '1x / -1s' : `${timeSkipCombo}x / -${Math.abs(
                          Math.pow(1.35, timeSkipCombo)
                        )}s`}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Not in transit */}
              {!transit && route.length > 0 && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      className={cn(
                        'flex-1 rounded-lg py-2.5 text-sm font-medium shadow-lg shadow-cyan-600/30',
                        insufficientEnergy
                          ? 'cursor-not-allowed border border-cyan-500/50 bg-cyan-900/30 text-cyan-300 opacity-50'
                          : 'bg-cyan-600 text-white active:bg-cyan-700'
                      )}
                      disabled={insufficientEnergy}
                      onClick={handleEngageWarp}
                    >
                      <Command className="mr-1 h-4 w-4" />
                      Engage Warp
                      {insufficientEnergy && (
                        <span className="ml-1 text-[10px] text-red-400">Insufficient Energy</span>
                      )}
                    </button>
                    <button
                      className="rounded-lg border border-cyan-700/50 bg-cyan-900/30 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
                      onClick={handleClearRoute}
                    >
                      <Cross className="mr-1 h-4 w-4" /> Clear Route
                    </button>
                  </div>
                </div>
              )}

              {/* Default empty state */}
              {!transit && route.length === 0 && (
                <div className="pt-4 text-center">
                  <p className="text-[10px] text-slate-500">No route plotted. Tap a star to begin.</p>
                </div>
              )}

              {/* Tail severing hint */}
              {route.length > 1 && !transit && (
                <div className="mt-3 rounded-lg border border-cyan-700/30 bg-cyan-900/10 p-3">
                  <p className="mb-1 text-[10px] text-cyan-300/60">Tail Severing</p>
                  <p className="text-[10px] text-slate-400">
                    Tap any star in the route to sever the tail — downstream hops are removed, keeping
                    the route contiguous from Sol.
                  </p>
                </div>
              )}

              {/* Time-Skip combo display when not in transit but route plotted */}
              {route.length > 1 && !transit && timeSkipCombo > 0 && (
                <div className="mt-2 rounded-lg border border-cyan-500/30 bg-cyan-900/30 p-2">
                  <p className="text-[10px] text-cyan-300/60">Time-Skip Combo</p>
                  <p className="font-mono text-cyan-100">
                    {timeSkipCombo}x
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof StarMapCanvas> = {
  title: '02-Core-Shell-And-Map/StarMapCanvas',
  component: StarMapCanvas,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'iphone14' },
  },
};

export default meta;
type Story = StoryObj<typeof StarMapCanvas>;

// ── Story exports with numeric ordering (names start with number for sidebar order) ─────────────────────────────
export const _01_SolIdleDefault: Story = {
  name: '01_SolIdleDefault',
  args: {
    mode: 'default',
    credits: 100,
    energy: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Starting in Sol with adjacent unknown systems visible. Sol is active (green), adjacent nodes dimmed but reachable. No route plotted. 44×44px minimum touch hitboxes on every node.',
      },
    },
  },
};

export const _02_SingleHopSelected: Story = {
  name: '02_SingleHopSelected',
  args: {
    mode: 'single-hop',
    selectedStar: 'proxima',
    route: ['sol', 'proxima'],
    credits: 100,
    energy: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Single hop selected: Sol → Proxima Centauri. Drawer shows energy cost (42) and travel time (2m 6s). Tap Proxima again to sever, tap another reachable star to extend.',
      },
    },
  },
};

export const _03_MultiHopItinerary: Story = {
  name: '03_MultiHopItinerary',
  args: {
    mode: 'multi-hop',
    route: ['sol', 'proxima', 'epsilon', 'kepler'],
    credits: 100,
    energy: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Multi-hop contiguous route: Sol → Proxima → Epsilon Eridani → Kepler-186. Route lines animate along active edges. Tail-severing deselect supported. Clear Route available. Engage Warp enabled if energy sufficient.',
      },
    },
  },
};

export const _04_InsufficientEnergyBlocked: Story = {
  name: '04_InsufficientEnergyBlocked',
  args: {
    mode: 'insufficient-energy',
    route: ['sol', 'proxima', 'epsilon', 'kepler', 'cygnus'],
    credits: 100,
    energy: 50,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Insufficient energy: Engage Warp button disabled when totalRouteEnergyCost > currentEnergy. Shows red warning text.',
      },
    },
  },
};

export const _05_InTransitWithCancelNearestNode: Story = {
  name: '05_InTransitWithCancelNearestNode',
  args: {
    mode: 'in-transit',
    route: ['sol', 'proxima', 'epsilon'],
    transit: true,
    credits: 100,
    energy: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          'In transit: Active warp countdown with Cancel Hop (drops out at nearest node consuming hop energy) and live Exponential Time-Skip Clicker (-1s initial tap, scaling exponentially via Math.pow(1.35,comboTier), decaying back to 1s when tapping pauses).',
      },
    },
  },
};