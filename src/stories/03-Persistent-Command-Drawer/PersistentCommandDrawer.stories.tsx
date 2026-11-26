import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Zap, Box, Package, Cross, Target, Command } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ELEMENTS, type PeriodicElement, type ElementRarity } from "@/lib/elements";
import {
  formatCredits,
  calculateWarpEnergyCost,
  calculateTravelTimeSeconds,
} from "@/lib/game";

interface RouteHop {
  from: string;
  to: string;
  distanceLy: number;
  energyCost: number;
  travelTimeSeconds: number;
}

interface CelestialBody {
  id: string;
  name: string;
  type: "star" | "planet" | "moon";
  safety: "safe" | "unsafe";
  preScanHints: string[];
  scanned: boolean;
  minableElements: { symbol: string; extractionDuration: number }[];
  landingDuration: number;
}

interface CodexState {
  discoveredElements: Set<number>;
  completed: boolean;
}

interface PersistentCommandDrawerProps {
  activeView: "route" | "systems" | "cargo" | "market" | "codex";
  route?: string[];
  credits: number;
  energy: number;
  cargoHold: { symbol: string; quantity: number }[];
  codex: CodexState;
  prestige?: { systemsDiscovered: number; planetsDiscovered: number; totalMined: number };
}

const RARITY_COLORS: Record<ElementRarity, string> = {
  common: "text-slate-300",
  uncommon: "text-cyan-300",
  rare: "text-amber-300",
  epic: "text-purple-300",
  legendary: "text-yellow-300",
};

const RARITY_BG: Record<ElementRarity, string> = {
  common: "bg-slate-900/30 border-slate-700/50",
  uncommon: "bg-cyan-900/30 border-cyan-700/50",
  rare: "bg-amber-900/30 border-amber-700/50",
  epic: "bg-purple-900/30 border-purple-700/50",
  legendary: "bg-yellow-900/30 border-yellow-700/50",
};

function rarityColor(rarity: ElementRarity): string {
  return RARITY_COLORS[rarity];
}

const EDGES = [
  { from: "sol", to: "proxima", distance: 4.2 },
  { from: "proxima", to: "epsilon", distance: 2.5 },
  { from: "epsilon", to: "kepler", distance: 8.0 },
  { from: "kepler", to: "cygnus", distance: 15.0 },
];

const SYSTEMS = [
  {
    id: "sol",
    name: "Sol",
    bodies: [
      { id: "sol-star", name: "Sol", type: "star" as const, safety: "safe" as const, preScanHints: ["H", "He", "C", "N", "O"], scanned: false, minableElements: [] as const, landingDuration: 0 },
      { id: "mercury", name: "Mercury", type: "planet" as const, safety: "unsafe" as const, preScanHints: ["Fe", "Si", "Mg"], scanned: false, minableElements: [] as const, landingDuration: 30 },
      { id: "venus", name: "Venus", type: "planet" as const, safety: "unsafe" as const, preScanHints: ["C", "S", "Fe"], scanned: false, minableElements: [] as const, landingDuration: 45 },
      { id: "earth", name: "Earth", type: "planet" as const, safety: "safe" as const, preScanHints: ["H", "O", "Fe", "Si", "Al"], scanned: false, minableElements: [] as const, landingDuration: 20 },
      { id: "moon", name: "Moon", type: "moon" as const, safety: "safe" as const, preScanHints: ["Si", "Fe", "Al", "Ca", "Ti"], scanned: false, minableElements: [] as const, landingDuration: 10 },
      { id: "mars", name: "Mars", type: "planet" as const, safety: "safe" as const, preScanHints: ["Fe", "Si", "Mg", "Al", "Ca"], scanned: false, minableElements: [] as const, landingDuration: 20 },
    ] as readonly CelestialBody[],
    hasSpaceport: true,
  },
];

const INITIAL_CODEX: CodexState = {
  discoveredElements: new Set(),
  completed: false,
};

const MARKET_ITEMS = [
  { symbol: "Au", name: "Gold", bid: 550, ask: 580 },
  { symbol: "Fe", name: "Iron", bid: 55, ask: 65 },
  { symbol: "He", name: "Helium", bid: 15, ask: 20 },
  { symbol: "C", name: "Carbon", bid: 30, ask: 40 },
];

const PersistentCommandDrawer = ({
  activeView,
  route,
  credits,
  energy,
  cargoHold,
  codex,
  prestige,
}: PersistentCommandDrawerProps) => {
  const [miningElement, setMiningElement] = useState<PeriodicElement | null>(null);

  // ── Route & Transit View ──
  if (activeView === "route") {
    const hops: RouteHop[] = [];
    if (route && route.length > 1) {
      for (let i = 0; i < route.length - 1; i++) {
        const edge = EDGES.find(
          (e) => (e.from === route[i] && e.to === route[i + 1]) ||
                 (e.from === route[i + 1] && e.to === route[i])
        );
        if (edge) {
          hops.push({
            from: edge.from,
            to: edge.to,
            distanceLy: edge.distance,
            energyCost: calculateWarpEnergyCost(edge.distance),
            travelTimeSeconds: calculateTravelTimeSeconds(edge.distance),
          });
        }
      }
    }

    const totalEnergyCost = hops.reduce((sum, h) => sum + h.energyCost, 0);
    const insufficientEnergy = totalEnergyCost > energy;

    return (
      <Drawer snapPoints={[0.15, 0.35, 0.65]} activeSnapPoint={0.35}>
        <DrawerTrigger asChild>
          <button className="w-full py-3 rounded-md bg-cyan-600 text-white text-sm font-medium shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" /> Route & Transit
          </button>
        </DrawerTrigger>
        <DrawerOverlay className="fixed inset-0 z-[50] bg-black/70" />
        <DrawerContent className="max-h-[65vh] p-4 space-y-4">
          <DrawerTitle>Route & Transit</DrawerTitle>

          {route && route.length > 1 && (
            <div className="space-y-2">
              <p className="text-[10px] text-cyan-300 font-medium">Itinerary</p>
              {route.map((starId) => {
                const star = SYSTEMS.find((s) => s.id === starId);
                if (!star) return null;
                return (
                  <div
                    key={starId}
                    className="flex items-center gap-2 p-2 rounded-lg border bg-black/20 border-cyan-400 bg-cyan-500/10"
                  >
                    <span className="text-xs font-mono text-cyan-200">{star.name}</span>
                    <button className="text-cyan-400/60 hover:text-cyan-400 p-1" aria-label="Remove stop">
                      <Cross className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              <div className="border-t pt-2 space-y-2">
                <button
                  className={cn(
                    "w-full py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-cyan-600/30",
                    insufficientEnergy
                      ? "bg-cyan-900/30 border border-cyan-500/50 text-cyan-300 cursor-not-allowed opacity-50"
                      : "bg-cyan-600 text-white active:bg-cyan-700",
                  )}
                  disabled={insufficientEnergy}
                >
                  <Command className="w-4 h-4 mr-1" /> Engage Warp
                </button>
                <button
                  className="w-full py-2 rounded-lg text-sm font-medium bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
                  onClick={() => {}}
                >
                  <Cross className="w-4 h-4 mr-1" /> Cancel Hop
                </button>
              </div>
            </div>
          )}

          {!route || route.length <= 1 ? (
            <div className="pt-3 border-t border-slate-700/50 space-y-3">
              <p className="text-[10px] text-cyan-300">Energy & Transit</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-[10px] text-slate-400">Energy</p>
                  <span className="font-mono text-cyan-300 font-bold">{energy}</span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Needed</p>
                  <span className={cn("font-mono text-xs", totalEnergyCost > energy ? "text-red-400" : "text-cyan-300")}>
                    {totalEnergyCost}
                  </span>
                </div>
              </div>
              {totalEnergyCost > energy && (
                <p className="text-[10px] text-red-400">Insufficient Energy — Engage Warp disabled</p>
              )}

              <button
                className="w-full py-2.5 rounded-lg text-sm font-medium bg-gradient-to-br from-cyan-600 to-cyan-800 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-transform"
                onClick={() => {}}
              >
                <Zap className="w-5 h-5 text-green-400" />
                <span>⚡ TIME-SKIP (-1s / Tap)</span>
                <span className="ml-2 text-xs font-mono text-green-300">1x Combo</span>
              </button>
            </div>
          ) : null}

          {route && route.length > 1 && (
            <button
              className="w-full py-2 rounded-lg text-sm font-medium bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
              onClick={() => {}}
            >
              <Cross className="w-4 h-4 mr-1" /> Cancel Hop
            </button>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  // ── System & Bodies View ──
  if (activeView === "systems") {
    const system = SYSTEMS[0];

    return (
      <Drawer snapPoints={[0.15, 0.35, 0.65]} activeSnapPoint={0.35}>
        <DrawerTrigger asChild>
          <button className="w-full py-3 rounded-md bg-cyan-600 text-white text-sm font-medium shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2">
            <Target className="w-4 h-4" /> System & Bodies
          </button>
        </DrawerTrigger>
        <DrawerOverlay className="fixed inset-0 z-[50] bg-black/70" />
        <DrawerContent className="max-h-[65vh] p-4 space-y-4">
          <DrawerTitle>System & Bodies</DrawerTitle>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-[10px] text-slate-400">System</p>
              <p className="font-mono text-cyan-100">{system.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Spaceport</p>
              <p className={cn("font-mono text-xs", system.hasSpaceport ? "text-green-400" : "text-red-400/50")}>
                {system.hasSpaceport ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {system.bodies.map((body: CelestialBody) => {
              const safetyColor = body.safety === "safe" ? "text-green-400" : body.safety === "unsafe" ? "text-red-400" : "text-amber-400";
              const safetyBorder = body.safety === "safe" ? "border-green-700/30" : body.safety === "unsafe" ? "border-red-700/30" : "border-amber-700/30";
              const safetyLabel = body.safety === "safe" ? "Safe" : body.safety === "unsafe" ? "Unsafe" : "Radiation";

              return (
                <div
                  key={body.id}
                  className={cn("p-3 rounded-lg border space-y-1", safetyBorder)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-3 h-3 rounded-md",
                        body.type === "star" ? "bg-yellow-400" : body.type === "planet" ? "bg-orange-400" : "bg-blue-400",
                      )} />
                      <span className="font-medium text-cyan-100">{body.name}</span>
                    </div>
                    <span className={cn("text-[10px] font-medium", safetyColor)}>{safetyLabel}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-cyan-300/60">
                    <div>
                      <p className="mb-0.5">Hints</p>
                      <p>{body.preScanHints.slice(0, 3).join(", ")}</p>
                    </div>
                    <div>
                      <p className="mb-0.5">Land</p>
                      <button
                        className={cn(
                          "w-full py-2 rounded text-xs font-medium",
                          body.safety === "safe"
                            ? "bg-cyan-600 text-white active:bg-cyan-700"
                            : "bg-red-900/30 border border-red-700/50 text-red-400 hover:bg-red-800/30 cursor-not-allowed opacity-70",
                        )}
                        disabled={body.safety !== "safe"}
                      >
                        {body.safety === "safe" ? "Land" : "⚠️ Unsafe — Game Over"}
                      </button>
                    </div>
                  </div>

                  {body.scanned && (
                    <div className="mt-2 p-2 rounded-lg border border-cyan-700/30 bg-cyan-900/20">
                      <p className="text-[10px] text-cyan-300/60">Minable Elements</p>
                      {body.minableElements.map((el: { symbol: string; extractionDuration: number }) => (
                        <div key={el.symbol} className="flex justify-between text-[10px] text-cyan-200">
                          <span>{el.symbol}</span>
                          <span className="font-mono text-cyan-300">{el.extractionDuration}s</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-green-400 transition-all duration-1000"
                      style={{ width: `${(body.landingDuration / 60) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // ── Cargo Hold View ──
  if (activeView === "cargo") {
    return (
      <Drawer snapPoints={[0.15, 0.35, 0.65]} activeSnapPoint={0.35}>
        <DrawerTrigger asChild>
          <button className="w-full py-3 rounded-md bg-cyan-600 text-white text-sm font-medium shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2">
            <Package className="w-4 h-4" /> Cargo Hold
          </button>
        </DrawerTrigger>
        <DrawerOverlay className="fixed inset-0 z-[50] bg-black/70" />
        <DrawerContent className="max-h-[65vh] p-4 space-y-4">
          <DrawerTitle>Cargo Hold (Unlimited)</DrawerTitle>

          {cargoHold.length === 0 && (
            <p className="text-[10px] text-slate-500 text-center py-4">Empty hold</p>
          )}

          <div className="space-y-3 max-h-[40vh] overflow-y-auto">
            {cargoHold.map((slot) => {
              const element = ELEMENTS.find((e) => e.symbol === slot.symbol);
              if (!element) return null;

              return (
                <div
                  key={element.atomicNumber}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3",
                    "border-slate-600/50 bg-slate-900/20",
                    `border-${element.rarity}-700/30 ${RARITY_BG[element.rarity]}`,
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <span className={cn("font-mono font-bold", rarityColor(element.rarity))}>{element.symbol}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-cyan-100">{element.name}</p>
                      <p className="text-xs text-slate-500/60">{slot.quantity}</p>
                    </div>
                    <span className="font-mono text-xs text-cyan-300">{slot.quantity}</span>
                  </div>

                  <div className="mt-2 text-[10px] text-cyan-200/60">
                    <p className="text-[10px] text-cyan-200">Value: {formatCredits(element.baselineValue * slot.quantity)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 p-3 rounded-lg border border-cyan-700/30 bg-cyan-900/10">
            <p className="text-[10px] text-cyan-300 font-medium mb-2">Mine Element</p>
            <div className="space-y-1 max-h-[180px] overflow-y-auto">
              {ELEMENTS.slice(0, 20).map((element) => {
                const rarityColor = RARITY_COLORS[element.rarity];
                return (
                  <button
                    key={element.symbol}
                    onClick={() => setMiningElement(element)}
                    className={cn(
                      "flex flex-col items-center gap-1 px-2 py-1 rounded text-[10px]",
                      `border-${element.rarity}-700/30 bg-slate-900/20`,
                    )}
                  >
                    <span className={cn("font-mono font-bold", rarityColor)}>{element.symbol}</span>
                    <span className="text-[10px] text-cyan-300/60">{element.extractionDuration}s</span>
                  </button>
                );
              })}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // ── Spaceport Market View ──
  if (activeView === "market") {
    return (
      <Drawer snapPoints={[0.15, 0.35, 0.65]} activeSnapPoint={0.35}>
        <DrawerTrigger asChild>
          <button className="w-full py-3 rounded-md bg-cyan-600 text-white text-sm font-medium shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2">
            <Box className="w-4 h-4" /> Spaceport Market
          </button>
        </DrawerTrigger>
        <DrawerOverlay className="fixed inset-0 z-[50] bg-black/70" />
        <DrawerContent className="max-h-[65vh] p-4 space-y-4">
          <DrawerTitle>Spaceport Market</DrawerTitle>

          <p className="text-[10px] text-cyan-300 mb-3">
            Static seeded Bid/Ask prices for Periodic Table elements.
            Precalculated at world creation — never fluctuate dynamically.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {MARKET_ITEMS.map((el) => {
              const element = ELEMENTS.find((e) => e.symbol === el.symbol);
              const rc = element ? rarityColor(element.rarity) : "text-slate-300";

              return (
                <div
                  key={el.symbol}
                  className="flex items-center justify-between rounded-xl bg-slate-900 border border-slate-600 p-3 hover:border-cyan-500/30 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-900/30 flex items-center justify-center">
                      <span className={cn("font-mono font-bold", rc)}>{el.symbol}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-cyan-100">{el.name}</p>
                      <p className="text-xs text-slate-400/60">t</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-medium text-cyan-200">{formatCredits(el.bid)}</p>
                      <p className="text-[10px] text-slate-400/60">bid</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-medium text-amber-400">{formatCredits(el.ask)}</p>
                      <p className="text-[10px] text-slate-400/60">ask</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <button
              className="w-full py-2 rounded-lg text-sm font-medium bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
              onClick={() => {}}
            >
              Buy Selected
            </button>
            <button
              className="w-full py-2 rounded-lg text-sm font-medium bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
              onClick={() => {}}
            >
              Sell Selected
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // ── Periodic Discovery Codex & Prestige View ──
  if (activeView === "codex") {
    return (
      <Drawer snapPoints={[0.15, 0.35, 0.65]} activeSnapPoint={0.35}>
        <DrawerTrigger asChild>
          <button className="w-full py-3 rounded-md bg-cyan-600 text-white text-sm font-medium shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2">
            <Target className="w-4 h-4" /> Discovery Codex
          </button>
        </DrawerTrigger>
        <DrawerOverlay className="fixed inset-0 z-[50] bg-black/70" />
        <DrawerContent className="max-h-[65vh] p-4 space-y-4">
          <DrawerTitle>Discovery Codex</DrawerTitle>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-cyan-300">
            <div>
              <p className="text-[10px] font-medium mb-1">Discovered</p>
              <p className="font-mono text-cyan-100">{codex.discoveredElements.size}</p>
              <p className="text-[10px] text-slate-500/60">/ 118</p>
            </div>
            <div>
              <p className="text-[10px] font-medium mb-1">Completed</p>
              <p className={cn("text-cyan-400", codex.completed ? "" : "text-slate-500/60")}>
                {codex.completed ? "YES" : "NO"}
              </p>
            </div>
          </div>

          {codex.completed && (
            <p className="mt-2 text-[10px] text-yellow-400 font-medium">ENDLESS PLAY MODE UNLOCKED</p>
          )}

          {/* Prestige counters */}
          {prestige && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg border border-cyan-700/30 bg-cyan-900/20">
                <p className="text-[10px] text-cyan-300 font-medium">Systems Discovered</p>
                <p className="font-mono text-cyan-100 text-lg">{prestige.systemsDiscovered}</p>
              </div>
              <div className="p-2 rounded-lg border border-cyan-700/30 bg-cyan-900/20">
                <p className="text-[10px] text-cyan-300 font-medium">Planets Discovered</p>
                <p className="font-mono text-cyan-100 text-lg">{prestige.planetsDiscovered}</p>
              </div>
              <div className="p-2 rounded-lg border border-cyan-700/30 bg-cyan-900/20">
                <p className="text-[10px] text-cyan-300 font-medium">Total Mined</p>
                <p className="font-mono text-cyan-100 text-lg">{prestige.totalMined}</p>
              </div>
            </div>
          )}

          <div className="mt-4">
            <p className="text-[10px] text-cyan-300/60 font-medium mb-2">Discovery Grid</p>
            <div className="grid grid-cols-4 gap-1 max-h-[300px] overflow-y-auto">
              {ELEMENTS.map((element) => {
                const isDiscovered = codex.discoveredElements.has(element.atomicNumber);
                const rc = RARITY_COLORS[element.rarity];
                return (
                  <div
                    key={element.symbol}
                    className={cn(
                      "flex items-center justify-center rounded-lg border p-1 text-[10px]",
                      isDiscovered ? "bg-cyan-600/20 border-cyan-500/50" : "bg-slate-900/30 border-slate-700/50",
                      isDiscovered ? rc : "text-slate-400",
                    )}
                  >
                    <span className={cn("font-mono font-bold", rc)}>{element.symbol}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return null as any;
};

const meta: Meta<typeof PersistentCommandDrawer> = {
  title: "03-Persistent-Command-Drawer/PersistentCommandDrawer",
  component: PersistentCommandDrawer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "iphone14" },
  },
};

export default meta;
type Story = StoryObj<typeof PersistentCommandDrawer>;

export const NavigationAndClicker: Story = {
  args: {
    activeView: "route" as const,
    credits: 100,
    energy: 100,
    cargoHold: [],
    codex: INITIAL_CODEX,
    route: ["sol", "proxima", "epsilon", "kepler"],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Plotted multi-hop itinerary (Sol → Proxima → Epsilon → Kepler), Energy/time totals, Engage/Cancel controls, and interactive Exponential Time-Skip Clicker (`-1s` scaling exponentially with click cadence).",
      },
    },
  },
};

export const SystemBodiesPreScanHints: Story = {
  args: {
    activeView: "systems" as const,
    credits: 100,
    energy: 100,
    cargoHold: [],
    codex: INITIAL_CODEX,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Small list of stars, planets, and moons in the current system displaying orbital/spectral pre-scan resource hints and Scan Body action. Shows Safe vs. Unknown classification and Scan Body timer.",
      },
    },
  },
};

export const ScannedBodiesAndUnsafeWarning: Story = {
  args: {
    activeView: "systems" as const,
    credits: 100,
    energy: 100,
    cargoHold: [],
    codex: INITIAL_CODEX,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Post-scan view showing Safe bodies vs. Unsafe planet hazard warnings and Land on Body timer. Scanning reveals Safe vs. Unsafe classification and exact minable elements with per-element cycle durations.",
      },
    },
  },
};

export const LandedContinuousIdleMining: Story = {
  args: {
    activeView: "cargo" as const,
    credits: 100,
    energy: 100,
    cargoHold: [
      { symbol: "Fe", quantity: 5 },
      { symbol: "Si", quantity: 3 },
    ],
    codex: INITIAL_CODEX,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Landed surface view allowing selection of one Periodic Table element with per-element cycle duration, running continuous background idle mining with active clicker acceleration. Cargo Hold is unlimited.",
      },
    },
  },
};

export const CargoHoldUnlimited: Story = {
  args: {
    activeView: "cargo" as const,
    credits: 100,
    energy: 100,
    cargoHold: [
      { symbol: "Au", quantity: 5 },
      { symbol: "Fe", quantity: 20 },
      { symbol: "He", quantity: 10 },
    ],
    codex: INITIAL_CODEX,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Unlimited Cargo Hold inventory list showing collected Periodic Table elements (atomic number, symbol, name, quantity). Cargo Hold is unlimited in the MVP — no capacity caps.",
      },
    },
  },
};

export const SpaceportMarketArbitrage: Story = {
  args: {
    activeView: "market" as const,
    credits: 100,
    energy: 100,
    cargoHold: [{ symbol: "Au", quantity: 5 }],
    codex: INITIAL_CODEX,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Docked at a Spaceport (Sol or ~10% safe system port) showing static precalculated Bid/Ask integer Credit order book for buying and selling Periodic Table elements.",
      },
    },
  },
};

export const NoSpaceportInSystem: Story = {
  args: {
    activeView: "systems" as const,
    credits: 100,
    energy: 100,
    cargoHold: [],
    codex: INITIAL_CODEX,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Showing NoSpaceportInSystem state — only ~10% of safe star systems (plus starter Sol) have a Spaceport. This story demonstrates the absence of a Spaceport in a system.",
      },
    },
  },
};

export const PeriodicDiscoveryCodex: Story = {
  args: {
    activeView: "codex" as const,
    credits: 100,
    energy: 100,
    cargoHold: [{ symbol: "Au", quantity: 5 }],
    codex: {
      discoveredElements: new Set([1, 2, 6, 7, 8, 9, 16, 17, 26, 27, 28, 47, 53, 79, 80, 82]),
      completed: false,
    },
    prestige: {
      systemsDiscovered: 12,
      planetsDiscovered: 47,
      totalMined: 842,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "118-element Periodic Table discovery grid showing discovered vs. undiscovered elements, Win State progress (`e.g., 14 / 118` and `117 / 118`), and cumulative Prestige Points (Systems Discovered, Planets Discovered, Total Mined).",
      },
    },
  },
};