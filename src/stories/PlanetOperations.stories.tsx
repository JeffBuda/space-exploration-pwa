import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

// Planet data
const PLANETS = [
  {
    id: "kepler-186f",
    name: "Kepler-186f",
    safety: "safe",
    atmosphere: "thin",
    minerals: ["Iron", "Silicon", "Water Ice"],
    relics: 0,
    scanTime: 10,
    mineralYield: 120,
    relicChance: 0,
  },
  {
    id: "trappist-1e",
    name: "Trappist-1e",
    safety: "radiation",
    atmosphere: "dense",
    minerals: ["Carbon", "Oxygen"],
    relics: 3,
    scanTime: 8,
    mineralYield: 180,
    relicChance: 15,
  },
  {
    id: "proxima-b",
    name: "Proxima b",
    safety: "danger",
    atmosphere: "none",
    minerals: ["Lithium", "Rare Earths"],
    relics: 1,
    scanTime: 12,
    mineralYield: 200,
    relicChance: 25,
  },
];

const PlanetOperations = ({
  planetId,
  mode,
}: {
  planetId?: string;
  mode?: "orbit-unscanned" | "scanning-in-progress" | "scan-complete-landing" | "surface-expedition";
}) => {
  const planet = PLANETS.find((p) => p.id === planetId) || PLANETS[0];
  const [open, setOpen] = useState(false);
  const [boostTimer, setBoostTimer] = useState(0);
  const [expeditionChoice, setExpeditionChoice] = useState<
    "minerals" | "relics"
  >("minerals");

  // Scan progress
  const [scanProgress, setScanProgress] = useState(0);

  const safetyColor: Record<string, string> = {
    safe: "text-green-400",
    radiation: "text-amber-400",
    danger: "text-red-400",
  };

  const atmosphereText: Record<string, string> = {
    thin: "Thin atmosphere",
    dense: "Dense atmosphere",
    none: "No atmosphere",
  };

  const handleBoost = () => setBoostTimer((t) => Math.max(t - 1, 0));

  const safetyBadge = (status: string) => {
    switch (status) {
      case "safe":
        return <span className="px-2 py-0.5 rounded text-[10px] text-green-400 bg-green-900/30 border border-green-700/30">{status}</span>;
      case "radiation":
        return <span className="px-2 py-0.5 rounded text-[10px] text-amber-400 bg-amber-900/30 border border-amber-700/30">{status}</span>;
      case "danger":
        return <span className="px-2 py-0.5 rounded text-[10px] text-red-400 bg-red-900/30 border border-red-700/30">{status}</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] text-cyan-300 bg-cyan-900/30 border border-cyan-700/30">{status}</span>;
    }
  };

  return (
    <div className="relative">
      {/* Planet info card */}
      <div className="fixed top-6 left-6 right-6 mx-auto max-w-sm">
        <div className={cn(
          "bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-5 shadow-xl shadow-black/30",
          "animate-fade-in"
        )}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-cyan-100">{planet.name}</h3>
            {safetyBadge(planet.safety)}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-sm">
              <p className="text-cyan-300/60">Atmosphere</p>
              <p className="text-cyan-100">{atmosphereText[planet.atmosphere]}</p>
            </div>
            <div className="text-sm">
              <p className="text-cyan-300/60">Minerals</p>
              <p className="text-cyan-100">{planet.minerals.join(", ")}</p>
            </div>
          </div>

          {/* Tier 1 - default state */}
          {mode === "orbit-unscanned" && (
            <div className="space-y-3">
              <div className="text-center py-4">
                <span className="text-[3em]">🪐</span>
                <p className="text-cyan-300/60 mt-2">Uncharted Planet</p>
              </div>
              <button
                className="w-full py-3 rounded-lg text-sm font-medium bg-cyan-600 text-white active:bg-cyan-700 shadow-lg shadow-cyan-600/30"
                onClick={() => {}}
              >
                INITIATE ORBITAL SCAN (10m)
              </button>
              {/* Tier 3: Sensor Specs accordion */}
              <details className="pt-2 border-t border-[hsl(var(--border))]">
                <summary className="flex items-center justify-between text-xs text-cyan-400/60 cursor-pointer">
                  Sensor Specs
                  <span>▼</span>
                </summary>
                <div className="mt-2 p-2 bg-cyan-900/30 rounded-md text-[10px] text-cyan-300/50 space-y-1">
                  <div>Scan Speed Bonus: +15%</div>
                  <div>Range: 500 LY</div>
                  <div>Resolution: Sub-meter</div>
                </div>
              </details>
            </div>
          )}

          {/* Tier 2 - scanning */}
          {mode === "scanning-in-progress" && (
            <div className="space-y-3">
              <div className="w-full h-2 bg-cyan-900 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-green-400 transition-all duration-1000"
                  style={{ width: `${Math.min(100, scanProgress)}%` }}
                />
              </div>
              <p className="text-center text-[10px] font-mono text-cyan-100">
                Scanning planet... {Math.min(100, scanProgress)}%
              </p>
              <button
                className="w-full py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white active:bg-cyan-700"
                onClick={handleBoost}
              >
                <Zap className="w-4 h-4 mr-1" />
                ⚡ BOOST SENSORS (-1s)
              </button>
            </div>
          )}

          {/* Scan complete */}
          {mode === "scan-complete-landing" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-cyan-300">Safety Rating</p>
                  <p className={safetyColor[planet.safety] + " font-medium text-sm"}>
                    {planet.safety}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-cyan-300">Atmosphere</p>
                  <p className="text-cyan-200 font-medium text-sm">{atmosphereText[planet.atmosphere]}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-cyan-900/30 p-2 rounded-lg text-center">
                  <p className="text-[10px] text-cyan-300/60">Mineral Richness</p>
                  <p className="text-cyan-100 font-mono text-sm">{planet.mineralYield} / scan</p>
                </div>
                <div className="bg-cyan-900/30 p-2 rounded-lg text-center">
                  <p className="text-[10px] text-cyan-300/60">Relic Chance</p>
                  <p className="text-amber-400 font-mono text-sm">{planet.relicChance}%</p>
                </div>
              </div>
              <button
                className="w-full py-3 rounded-lg text-sm font-medium bg-cyan-600 text-white active:bg-cyan-700 shadow-lg shadow-cyan-600/30"
                onClick={() => {}}
              >
                INITIATE LANDING SEQUENCE (5m)
              </button>
            </div>
          )}

          {/* Surface expedition */}
          {mode === "surface-expedition" && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-cyan-100">Surface Expedition</h4>
              <div className="grid grid-cols-1 gap-3">
                {/* Guaranteed minerals */}
                <div className={cn(
                  "p-3 rounded-lg border",
                  expeditionChoice === "minerals" ? "bg-cyan-900/40 border-cyan-600/50" : "bg-cyan-900/10 border-cyan-900/50 hover:bg-cyan-800/30",
                  "cursor-pointer transition-colors"
                )}
                onClick={() => setExpeditionChoice("minerals")}>
                  <p className="text-xs text-cyan-300/60">Guaranteed Mineral Extraction</p>
                  <p className="text-cyan-100 font-medium">{planet.mineralYield} t / steady yield</p>
                  <p className="text-[10px] text-green-400 mt-1">Low Risk ✓</p>
                </div>

                {/* Deep relic survey */}
                <div className={cn(
                  "p-3 rounded-lg border",
                  expeditionChoice === "relics" ? "bg-amber-900/40 border-amber-600/50" : "bg-cyan-900/10 border-cyan-900/50 hover:bg-cyan-800/30",
                  "cursor-pointer transition-colors"
                )}
                onClick={() => setExpeditionChoice("relics")}>
                  <p className="text-xs text-amber-300/60">Deep Relic Survey</p>
                  <p className="text-amber-100 font-medium">{planet.relics}+ Codex artifacts</p>
                  <p className="text-[10px] text-amber-400 mt-1">{planet.relicChance}% chance</p>
                </div>
              </div>

              {/* Tier 3 - surface composition */}
              <details className="pt-2 border-t border-[hsl(var(--border))]">
                <summary className="flex items-center justify-between text-xs text-cyan-400/60 cursor-pointer">
                  Surface Composition Breakdown
                  <span>▼</span>
                </summary>
                <div className="mt-2 p-3 bg-cyan-900/30 rounded-md space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-cyan-300/60">Iron</span>
                    <span className="text-cyan-100 font-mono">45%</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-cyan-300/60">Silicon</span>
                    <span className="text-cyan-100 font-mono">30%</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-cyan-300/60">Water Ice</span>
                    <span className="text-cyan-100 font-mono">25%</span>
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* Drawer trigger */}
      <div className="fixed bottom-6 left-6 right-6 mx-auto">
        <Drawer snapPoints={[0.15, 0.35, 0.65]} activeSnapPoint={0.35}>
          <DrawerTrigger asChild>
            <button className="w-full py-3 rounded-lg bg-cyan-600 text-white text-sm font-medium shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2">
              {open ? "Close" : "Open Details"} <span>▼</span>
            </button>
          </DrawerTrigger>
          <DrawerOverlay className="fixed inset-0 z-[50] bg-black/70" />
          <DrawerContent className="max-h-[65vh] p-3">
            <DrawerTitle>Planet Data</DrawerTitle>
            <div className="space-y-3 text-[11px] text-cyan-300/60">
              <div className="flex justify-between">
                <span>Sector:</span>
                <span className="text-cyan-100">{planet.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Scan Time:</span>
                <span className="text-cyan-100">{planet.scanTime}m</span>
              </div>
              <div className="flex justify-between">
                <span>Relics:</span>
                <span className="text-amber-400">{planet.relics}</span>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

const meta: Meta<typeof PlanetOperations> = {
  title: "Exploration/PlanetOperations",
  component: PlanetOperations,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "iphone14" },
  },
};

export default meta;
type Story = StoryObj<typeof PlanetOperations>;

export const OrbitUnscanned: Story = {
  args: {
    planetId: "kepler-186f",
    mode: "orbit-unscanned",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tier 1: Unknown planet silhouette + [INITIATE ORBITAL SCAN (10m)]. Tier 3 expandable Sensor Specs shows scan speed bonus.",
      },
    },
  },
};

export const ScanningInProgress: Story = {
  args: {
    planetId: "trappist-1e",
    mode: "scanning-in-progress",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Active countdown progress bar + interactive [⚡ BOOST SENSORS (-1s)] clicker button.",
      },
    },
  },
};

export const ScanCompleteAndLanding: Story = {
  args: {
    planetId: "proxima-b",
    mode: "scan-complete-landing",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Reveals planet safety rating, atmosphere, and mineral richness (Tier 2), plus [INITIATE LANDING SEQUENCE (5m)].",
      },
    },
  },
};

export const SurfaceExpedition: Story = {
  args: {
    planetId: "kepler-186f",
    mode: "surface-expedition",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Landed state offering two clear cards: Guaranteed Mineral Extraction (steady yield, low risk) vs Deep Relic Survey (longer timer, rare Codex artifact chance), with expandable Surface Composition Breakdown (Tier 3).",
      },
    },
  },
};