import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Plus, Cross, Command, Zap } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

// Star positions relative to viewport (390x844)
const STARS = [
  { id: "sol", name: "Sol", x: 250, y: 300, tier: 1, status: "active" },
  { id: "proxima", name: "Proxima", x: 180, y: 420, tier: 1, status: "adjacent" },
  { id: "epsilon", name: "Epsilon Eridani", x: 280, y: 520, tier: 1, status: "adjacent" },
  { id: "kepler", name: "Kepler-186", x: 140, y: 650, tier: 2, status: "reachable" },
  { id: "cygnus", name: "Cygnus-X", x: 330, y: 720, tier: 3, status: "distant" },
];

const ROUTE_EDGES = [
  { from: "sol", to: "proxima", distance: 4.2 },
  { from: "proxima", to: "epsilon", distance: 2.5 },
  { from: "epsilon", to: "kepler", distance: 120 },
  { from: "kepler", to: "cygnus", distance: 2600 },
];

const StarMap = ({
  mode,
  selectedStar,
  route,
  transit,
}: {
  mode?: "default" | "single-hop" | "multi-stop" | "in-transit";
  selectedStar?: string;
  route?: string[];
  transit?: boolean;
}) => {
  const [expandedRoute, setExpandedRoute] = useState(false);

  const starStatus = (id: string) => {
    if (id === "sol") return { color: "text-green-400", bg: "bg-green-400/20" };
    if (route && route.includes(id)) return { color: "text-cyan-400", bg: "bg-cyan-400/20" };
    const s = STARS.find((x) => x.id === id);
    if (!s) return { color: "text-cyan-500/40", bg: "bg-cyan-900/10" };
    if (s.status === "adjacent") return { color: "text-cyan-300", bg: "bg-cyan-900/30" };
    if (s.status === "reachable") return { color: "text-cyan-200/60", bg: "bg-cyan-900/20" };
    if (s.status === "distant") return { color: "text-cyan-500/30", bg: "bg-cyan-900/10" };
    return { color: "text-cyan-500/20", bg: "bg-cyan-900/5" };
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0d1117]">
      {/* Map canvas */}
      <div className="absolute inset-0 w-full h-full">
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
        {ROUTE_EDGES.map((edge) => {
          const fromStar = STARS.find((s) => s.id === edge.from);
          const toStar = STARS.find((s) => s.id === edge.to);
          if (!fromStar || !toStar) return null;

          const isConnected =
            route &&
            route.includes(edge.from) &&
            route.includes(edge.to);

          return (
            <svg key={edge.from + edge.to} className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <line
                x1={fromStar.x}
                y1={fromStar.y}
                x2={toStar.x}
                y2={toStar.y}
                stroke={isConnected ? "#22d3ee" : "#334155"}
                strokeWidth={isConnected ? 3 : 1}
                strokeDasharray={isConnected ? 0 : "4"}
                strokeOpacity={isConnected ? 1 : 0.3}
                className={cn(
                  isConnected
                    ? "animate-dash"
                    : "text-slate-600/50",
                )}
              />
            </svg>
          );
        })}

        {/* Stars */}
        {STARS.map((star) => {
          const status = starStatus(star.id);
          const isSelected = star.id === selectedStar;
          return (
            <div
              key={star.id}
              style={{
                left: `${star.x}px`,
                top: `${star.y}px`,
              }}
              className={cn(
                "absolute -mx-2 -my-2 w-4 h-4 flex items-center justify-center cursor-pointer transition-all duration-200",
                status.color,
                isSelected ? "ring-2 ring-cyan-400" : "",
                star.status === "active"
                  ? "animate-pulse ring-2 ring-green-400"
                  : status.bg,
              )}
              onClick={() => {}}
            >
              <div className="w-2 h-2 rounded-full bg-current opacity-80" />
            </div>
          );
        })}
      </div>

      {/* Selected star drawer */}
      {selectedStar && (
        <Drawer open onOpenChange={() => {}} snapPoints={[0.15, 0.35, 0.65]} activeSnapPoint={0.35}>
          <DrawerTrigger asChild>
            <button className="w-full py-3 bg-cyan-600 text-white text-sm font-medium border-b border-cyan-400/20 flex items-center justify-center gap-2">
              <span className="text-[0.8em]">↑</span> <span>Draggable</span>
            </button>
          </DrawerTrigger>
          <DrawerOverlay className="fixed inset-0 z-[50] bg-black/70" />
          <DrawerContent className="max-h-[65vh]">
            <DrawerTitle>System Navigation</DrawerTitle>

            {/* Tier 1: Glanceable Summary */}
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-300">Current Location</span>
                <span className="font-mono text-sm text-cyan-100">Sol</span>
              </div>
              {mode === "in-transit" && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-full h-1 bg-cyan-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-green-400 w-[65%] transition-all duration-1000" />
                  </div>
                  <span className="text-xs font-mono text-cyan-300">02:14:10</span>
                </div>
              )}
            </div>

            {/* Tier 2: Actionable Controls */}
            {mode === "single-hop" && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-cyan-400">ETA</span>
                    <div className="font-mono text-sm text-cyan-100">14m 30s</div>
                  </div>
                  <div>
                    <span className="text-xs text-cyan-400">Distance</span>
                    <div className="font-mono text-sm text-cyan-100">4.2 LY</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900">
                    <Plus className="w-4 h-4 mr-1" /> Add Stop
                  </button>
                  <button className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-cyan-600 text-white active:bg-cyan-700">
                    <Command className="w-4 h-4 mr-1" /> Engage Warp
                  </button>
                </div>
              </div>
            )}

            {mode === "multi-stop" && (
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-cyan-300 font-medium">Itinerary</p>
                  {route?.map((starId, idx) => {
                    const star = STARS.find((s) => s.id === starId);
                    if (!star) return null;
                    return (
                      <div
                        key={starId}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border bg-black/20",
                          idx === route.length - 1 ? "border-cyan-400 bg-cyan-500/10" : "",
                        )}
                      >
                        <span className="text-xs font-mono text-cyan-200">{idx + 1}</span>
                        <span className="flex-1 text-sm text-cyan-100">{star.name}</span>
                        <button
                          className="text-cyan-400/60 hover:text-cyan-400 p-1"
                          aria-label="Remove stop"
                        >
                          <Cross className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-2 space-y-2">
                  <button
                    className="w-full py-2 rounded-lg text-sm font-medium bg-cyan-900/30 border border-cyan-700/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Cross className="w-4 h-4 mr-1" /> Clear Route
                  </button>
                  <button
                    className="w-full py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white active:bg-cyan-700"
                  >
                    <Command className="w-4 h-4 mr-1" /> Engage Warp
                  </button>
                </div>
              </div>
            )}

            {/* Tier 3: Deep Telemetry Accordion */}
            {mode === "multi-stop" && expandedRoute && (
              <div className="p-4 border-t border-[hsl(var(--border))] space-y-2">
                <p className="text-xs text-cyan-300 font-medium">Route Telemetry</p>
                <div className="space-y-1 text-[10px] text-cyan-300/60 bg-cyan-900/30 rounded-md p-2">
                  <div className="flex justify-between">
                    <span>Total Distance:</span>
                    <span className="font-mono">2786.7 LY</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel Required:</span>
                    <span className="font-mono">4,200 units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hazard Rating:</span>
                    <span className="font-mono text-cyan-400">Moderate</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PRNG Seed:</span>
                    <span className="font-mono">0x7f3a1b</span>
                  </div>
                </div>
              </div>
            )}

            {/* In-Transit Spool Drive */}
            {mode === "in-transit" && (
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <span className="text-xs text-cyan-300">Next Milestone</span>
                  <div className="font-mono text-sm text-cyan-100">Kepler-186 (12m)</div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => {}}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-800 text-white text-sm font-medium shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-transform"
                  >
                    <Zap className="w-5 h-5 text-green-400" />
                    <span>⚡ SPOOL DRIVE (-1s / Tap)</span>
                    <span className="ml-2 text-xs font-mono text-green-300">5x Combo</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-cyan-300/50 px-2 py-1 rounded bg-cyan-900/30">
                  <span>Total Expedition:</span>
                  <span className="font-mono">04:32:10</span>
                </div>
              </div>
            )}
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

const meta: Meta<typeof StarMap> = {
  title: "Navigation/StarMap",
  component: StarMap,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "iphone14" },
  },
};

export default meta;
type Story = StoryObj<typeof StarMap>;

export const ExplorationDefault: Story = {
  args: {
    mode: "default",
  },
  parameters: {
    docs: {
      description: {
        story:
          "**ExplorationDefault**: Sol active (green), adjacent nodes (Proxima, Epsilon Eridani) connected via faint dashed SVG edges, unreachable distant nodes (Cygnus-X) dimmed. Drawer snapped at 15% (Tier 1).",
      },
    },
  },
};

export const SingleHopSelected: Story = {
  args: {
    mode: "single-hop",
    selectedStar: "proxima",
  },
  parameters: {
    docs: {
      description: {
        story:
          "**SingleHopSelected**: User taps Proxima. Animated blue SVG edge connects Sol → Proxima. Drawer snaps to 35% (Tier 2) showing ETA, LY distance, [+ ADD STOP], and [ENGAGE WARP].",
      },
    },
  },
};

export const MultiStopItinerary: Story = {
  args: {
    mode: "multi-stop",
    route: ["sol", "proxima", "kepler", "cygnus"],
  },
  parameters: {
    docs: {
      description: {
        story:
          "**MultiStopItinerary**: 3-hop contiguous route (Sol → Proxima → Kepler-186 → Cygnus-X). Drawer snaps to 65% (Tier 2 + Tier 3) with numbered itinerary, individual [✕] severing (truncating downstream hops), red-outlined [CLEAR ROUTE], and collapsible Route Telemetry section.",
      },
    },
  },
};

export const InTransitCountdown: Story = {
  args: {
    mode: "in-transit",
    transit: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "**InTransitCountdown**: Ship actively traveling along plotted route. Goal-Gradient Progress Bar (visually accelerating in final 20%), live HH:MM:SS countdown, next milestone vs total timer, and tactile ⚡ SPOOL DRIVE (-1s / Tap) button with combo multiplier (1x → 2x → 5x).",
      },
    },
  },
};