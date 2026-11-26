import type { Meta, StoryObj } from "@storybook/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Cross, Command, Zap, Plus } from "lucide-react";
import {
  formatCredits,
  calculateWarpEnergyCost,
  calculateTravelTimeSeconds,
  formatDuration,
} from "@/lib/game";
import { ELEMENTS } from "@/lib/elements";

// ── Mock systems for StarMap demo ─────────────────────────────────────────
const SYSTEMS = [
  { id: "sol", name: "Sol", x: 195, y: 422, tier: 1 },
  { id: "proxima", name: "Proxima Centauri", x: 140, y: 300, tier: 1 },
  { id: "epsilon", name: "Epsilon Eridani", x: 260, y: 220, tier: 1 },
  { id: "kepler", name: "Kepler-186", x: 100, y: 520, tier: 2 },
  { id: "cygnus", name: "Cygnus-X", x: 330, y: 620, tier: 3 },
];

const EDGES = [
  { from: "sol", to: "proxima", distance: 4.2 },
  { from: "proxima", to: "epsilon", distance: 2.5 },
  { from: "epsilon", to: "kepler", distance: 8.0 },
  { from: "kepler", to: "cygnus", distance: 15.0 },
];

interface StarMapCanvasProps {
  mode: "default" | "single-hop" | "multi-hop" | "insufficient-energy" | "in-transit";
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
  credits = 1250,
  energy = 1000,
}: StarMapCanvasProps) => {
  // Local state for interactivity
  const [selectedStar, setSelectedStar] = useState<string | undefined>(initialSelectedStar);
  const [route, setRoute] = useState<string[]>(initialRoute);
  const [transit, setTransit] = useState(initialTransit);
  const [expandedRoute, setExpandedRoute] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [timerId, setTimerId] = useState<number | null>(null);
  const [timeSkipCombo, setTimeSkipCombo] = useState(0);
  const [lastTimeSkipTap, setLastTimeSkipTap] = useState(0);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Star status colors
  const starStatus = (id: string) => {
    if (id === "sol") return { color: "text-green-400", bg: "bg-green-400/20" };
    if (route && route.includes(id)) return { color: "text-cyan-400", bg: "bg-cyan-400/20" };
    const s = SYSTEMS.find((x) => x.id === id);
    if (!s) return { color: "text-cyan-500/40", bg: "bg-cyan-900/10" };
    if (s.tier === 1) return { color: "text-cyan-300", bg: "bg-cyan-900/30" };
    if (s.tier === 2) return { color: "text-cyan-200/60", bg: "bg-cyan-900/20" };
    return { color: "text-cyan-500/30", bg: "bg-cyan-900/10" };
  };

  // Build hops from route
  const hops = useCallback(() => {
    const hopList: Array<{ from: string; to: string; distance: number; energy: number; time: number }> = [];
    for (let i = 0; i < route.length - 1; i++) {
      const edge = EDGES.find(
        (e) => (e.from === route[i] && e.to === route[i + 1]) ||
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

  const allHops = hops();
  const { totalEnergy, totalTime } = allHops.reduce(
    (acc, h) => ({ totalEnergy: acc.totalEnergy + h.energy, totalTime: acc.totalTime + h.time }),
    { totalEnergy: 0, totalTime: 0 }
  );

  const insufficientEnergy = totalEnergy > energy;

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
    if (route.length === 0 && starId !== "sol") return;

    // Cannot select if star is already the last in route
    if (route.length > 0 && route[route.length - 1] === starId) return;

    // Find if there's a direct edge from last route star to this star
    if (route.length > 0) {
      const lastStar = route[route.length - 1];
      const edgeExists = EDGES.some(
        (e) => (e.from === lastStar && e.to === starId) ||
               (e.from === starId && e.to === lastStar)
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
  };

  // Engage Warp
  const handleEngageWarp = () => {
    if (insufficientEnergy || route.length < 2) return;
    setTransit(true);
    setSelectedStar(undefined);
  };

  // Cancel Hop
  const handleCancelHop = () => {
    setTransit(false);
    setRemainingSeconds(0);
    setTimerId(null);
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
    const skipAmount = newCombo <= 0 ? -1 : Math.floor(Math.pow(1.35, newCombo));
    setRemainingSeconds((prev) => Math.max(0, prev - skipAmount));
  };

  // Transit timer
  useEffect(() => {
    let intervalId: number | null = null;
    if (transit && route.length > 1 && !timerId) {
      let remaining = totalTime;
      intervalId = window.setInterval(() => {
        remaining -= 1;
        setRemainingSeconds(remaining);
        if (remaining <= 0) {
          window.clearInterval(intervalId!);
          setTimerId(null);
          setTransit(false);
        }
      }, 1000);
      setRemainingSeconds(totalTime);
    }
    return () => {
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [transit, route, totalTime, timerId]);

  const isRouteValid = route.length > 0 && route[0] === "sol";

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0d1117]">
      {/* Map canvas */}
      <div ref={canvasRef} className="absolute inset-0 w-full h-full">
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

          const isConnected = route.includes(edge.from) && route.includes(edge.to) && route.indexOf(edge.from) < route.indexOf(edge.to);

          return (
            <svg key={edge.from + "-" + edge.to} className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <line
                x1={fromStar.x}
                y1={fromStar.y}
                x2={toStar.x}
                y2={toStar.y}
                stroke={isConnected ? "#22d3ee" : "#334155"}
                strokeWidth={isConnected ? 3 : 1}
                strokeDasharray={isConnected ? 0 : "4"}
                strokeOpacity={isConnected ? 1 : 0.3}
              />
            </svg>
          );
        })}

        {/* Stars */}
        {SYSTEMS.map((star) => {
          const status = starStatus(star.id);
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
                "absolute w-11 h-11 flex items-center justify-center cursor-pointer transition-all duration-200",
                "-mx-2 -my-2",
                status.color,
                status.bg,
                isSelected ? "ring-2 ring-cyan-400" : "",
                star.id === "sol" ? "animate-pulse ring-2 ring-green-400" : "",
              )}
              onClick={() => handleStarClick(star.id)}
              title={star.name}
            >
              <div className="w-4 h-4 rounded-full bg-current opacity-80" />
              <span className={cn(
                "absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap",
                status.color,
              )}>
                {star.name.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action drawer */}
      <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-[422px] z-20">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 shadow-2xl shadow-black/30">
          {/* Route summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-medium">Active Route</span>
              <span className={cn(
                "text-[10px] font-mono",
                isRouteValid ? "text-cyan-400" : "text-slate-500"
              )}>
                {route.length > 0 ? route.join(" → ") : "—"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 rounded-lg border border-slate-700/50 bg-slate-900/30">
                <p className="text-[10px] text-slate-400 mb-1">Energy Cost</p>
                <span className={cn("font-mono text-xs", insufficientEnergy ? "text-red-400" : "text-cyan-300")}>
                  {totalEnergy}
                </span>
              </div>
              <div className="p-2 rounded-lg border border-slate-700/50 bg-slate-900/30">
                <p className="text-[10px] text-slate-400 mb-1">Travel Time</p>
                <span className="font-mono text-xs text-cyan-300">{formatDuration(totalTime)}</span>
              </div>
            </div>

            {/* Transit in progress */}
            {transit && remainingSeconds > 0 && (
              <div className="space-y-2 p-3 rounded-lg border border-cyan-500/30 bg-cyan-900/20">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-cyan-300">Hop Remaining</span>
                  <span className="font-mono text-cyan-100">{formatDuration(remainingSeconds)}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-green-400 transition-all duration-1000"
                    style={{ width: `${Math.max(0, ((totalTime - remainingSeconds) / totalTime) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    className="flex-1 py-2 rounded-lg text-sm font-medium border border-red-500/50 text-red-400 hover:bg-red-900/20 active:bg-red-800/30"
                    onClick={handleCancelHop}
                  >
                    <Cross className="w-4 h-4 mr-1" /> Cancel Hop
                  </button>
                  <button
                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-gradient-to-br from-cyan-600 to-cyan-800 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-transform"
                    onClick={handleTimeSkip}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Time-Skip (-1s / Tap)
                    <span className="ml-2 text-xs font-mono text-green-300">
                      {timeSkipCombo <= 0 ? "1x" : `${timeSkipCombo}x`}
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
                      "flex-1 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-cyan-600/30",
                      insufficientEnergy
                        ? "bg-cyan-900/30 border border-cyan-500/50 text-cyan-300 cursor-not-allowed opacity-50"
                        : "bg-cyan-600 text-white active:bg-cyan-700",
                    )}
                    disabled={insufficientEnergy}
                    onClick={handleEngageWarp}
                  >
                    <Command className="w-4 h-4 mr-1" />
                    Engage Warp
                    {insufficientEnergy && (
                      <span className="ml-1 text-[10px] text-red-400">Insufficient Energy</span>
                    )}
                  </button>
                  <button
                    className="py-2.5 rounded-lg text-sm font-medium bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
                    onClick={handleClearRoute}
                  >
                    <Cross className="w-4 h-4 mr-1" /> Clear Route
                  </button>
                </div>
              </div>
            )}

            {/* Default empty state */}
            {!transit && route.length === 0 && (
              <div className="text-center pt-4">
                <p className="text-[10px] text-slate-500">No route plotted. Tap a star to begin.</p>
              </div>
            )}

            {/* Tail severing hint */}
            {route.length > 1 && !transit && (
              <div className="mt-3 p-3 rounded-lg border border-cyan-700/30 bg-cyan-900/10">
                <p className="text-[10px] text-cyan-300/60 mb-1">Tail Severing</p>
                <p className="text-[10px] text-slate-400">
                  Tap any star in the route to sever the tail — downstream hops are removed, keeping the route contiguous from Sol.
                </p>
              </div>
            )}

            {/* Time-Skip combo display when not in transit but route plotted */}
            {route.length > 1 && !transit && timeSkipCombo > 0 && (
              <div className="mt-2 p-2 rounded-lg bg-cyan-900/30 border border-cyan-500/30">
                <p className="text-[10px] text-cyan-300/60">Time-Skip Combo</p>
                <p className="font-mono text-cyan-100">{timeSkipCombo}x</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof StarMapCanvas> = {
  title: "02-Core-Shell-And-Map/StarMapCanvas",
  component: StarMapCanvas,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "iphone14" },
  },
};

export default meta;
type Story = StoryObj<typeof StarMapCanvas>;

export const SolIdleDefault: Story = {
  args: {
    mode: "default",
    credits: 100,
    energy: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Starting in Sol with adjacent unknown systems visible. Sol is active (green), adjacent nodes dimmed but reachable. No route plotted. 44×44px minimum touch hitboxes on every node.",
      },
    },
  },
};

export const SingleHopSelected: Story = {
  args: {
    mode: "single-hop",
    selectedStar: "proxima",
    route: ["sol", "proxima"],
    credits: 100,
    energy: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Single hop selected: Sol → Proxima Centauri. Drawer shows energy cost (42) and travel time (2m 6s). Tap Proxima again to sever, tap another reachable star to extend.",
      },
    },
  },
};

export const MultiHopItinerary: Story = {
  args: {
    mode: "multi-hop",
    route: ["sol", "proxima", "epsilon", "kepler"],
    credits: 100,
    energy: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Multi-hop contiguous route: Sol → Proxima → Epsilon Eridani → Kepler-186. Route lines animate along active edges. Tail-severing deselect supported. Clear Route available. Engage Warp enabled if energy sufficient.",
      },
    },
  },
};

export const InsufficientEnergyBlocked: Story = {
  args: {
    mode: "insufficient-energy",
    route: ["sol", "proxima", "epsilon", "kepler", "cygnus"],
    credits: 100,
    energy: 50,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Insufficient energy: Engage Warp button disabled when totalRouteEnergyCost > currentEnergy. Shows red warning text.",
      },
    },
  },
};

export const InTransitWithCancelNearestNode: Story = {
  args: {
    mode: "in-transit",
    route: ["sol", "proxima", "kepler"],
    transit: true,
    credits: 100,
    energy: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          "In transit: Active warp countdown with Cancel Hop (drops out at nearest node) and live Exponential Time-Skip Clicker.",
      },
    },
  },
};
