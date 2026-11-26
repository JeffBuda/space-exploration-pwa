import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Zap,
  Box,
  Package,
  Shield,
  Rocket,
} from "lucide-react";
import { Drawer, DrawerContent, DrawerOverlay, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

// 5 Cargo types
const CARGO = [
  { id: "hydrogen", name: "Hydrogen Fuel", unit: "t", basePrice: 120, demandMod: 0 },
  { id: "alloys", name: "Refined Alloys", unit: "t", basePrice: 200, demandMod: 0 },
  { id: "polymers", name: "Bio-Polymers", unit: "t", basePrice: 350, demandMod: 0 },
  { id: "quantum", name: "Quantum Chips", unit: "t", basePrice: 900, demandMod: 0 },
  { id: "relics", name: "Alien Relics", unit: "t", basePrice: 5000, demandMod: 0 },
];

// Helper: format price
const formatPrice = (price: number) => `$${price.toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

// Helper: demand badge color
const demandBadgeColor = (price: number) => {
  if (price > 200) return "text-red-400";
  if (price > 150) return "text-amber-400";
  return "text-cyan-300";
};

const SpaceportMarket = ({
  mode,
}: {
  mode?: "trading-terminal" | "shipyard-upgrades";
}) => {
  const [selectedCargoId, setSelectedCargoId] = useState<string>("hydrogen");
  const [quantity, setQuantity] = useState(1);
  const [buyMode, setBuyMode] = useState<boolean>(true);
  const [marketIntel, setMarketIntel] = useState<boolean>(false);

  const totalCargo = CARGO.reduce((sum, c) => sum + c.basePrice, 0);
  const holdCapacity = 20;
  const currentHold = Math.min(totalCargo, holdCapacity);
  const selectedCargo = CARGO.find((c) => c.id === selectedCargoId) || CARGO[0];
  const price = selectedCargo.basePrice + (selectedCargo.basePrice * (selectedCargo.demandMod || 0)) / 100;

  return (
    <div className="relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 mx-auto max-w-[430px] px-4 py-3 border-b border-slate-600 bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-cyan-100">Spaceport</h2>
            <p className="text-slate-400 text-sm">Arbitrage & Cargo Economy</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Credits:</span>
            <span className="font-mono text-cyan-100 font-bold">1,840</span>
          </div>
        </div>
      </div>

      {/* Cargo Hold Capacity */}
      <div className="fixed bottom-12 left-6 right-6 mx-auto">
        <div className="w-full bg-slate-600 rounded-full h-3">
          <div
            className="h-full bg-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${((currentHold / holdCapacity) * 100).toFixed(1)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400/60 mt-1">
          <span>{Math.min(currentHold, holdCapacity)} / {holdCapacity} t</span>
          <span>{formatPrice(selectedCargo?.basePrice || 0)} / t</span>
        </div>
      </div>

      {/* Market */}
      <div className="fixed top-14 left-0 right-0 mx-auto max-w-[430px] pt-8">
        {/* Cargo rows */}
        <div className="space-y-2">
          {CARGO.map((cargo) => (
            <div
              key={cargo.id}
              className={cn(
                "flex items-center justify-between rounded-xl bg-slate-900 border border-slate-600 p-3 hover:border-cyan-500/30 cursor-pointer transition-all",
              )}
              onClick={() => setSelectedCargoId(cargo.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-900/30 flex items-center justify-center">
                  {cargo.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cyan-100">{cargo.name}</p>
                  <p className="text-xs text-slate-400/60">{cargo.unit}</p>
                </div>
                <span className="text-sm font-medium text-cyan-200" style={{ color: demandBadgeColor(selectedCargo.basePrice) }}>
                  {formatPrice(selectedCargo.basePrice)}
                </span>
              </div>

              {/* Tier 2: Expanded on tap */}
              {selectedCargoId === cargo.id && (
                <div className="mt-2 pt-2 border-t border-slate-600 space-y-2">
                  <p className="text-xs text-slate-400 font-medium">Quantity</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-2 py-1 rounded text-[10px] border border-cyan-400/30 text-cyan-300"
                    >
                      -
                    </button>
                    <span className="font-mono text-cyan-200">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(holdCapacity - currentHold, q + 1))}
                      className="px-2 py-1 rounded text-[10px] border border-cyan-400/30 text-cyan-300"
                    >
                      +
                    </button>
                  </div>
                  <div className="mt-2 flex justify-between text-[10px]">
                    <span>Cost: {formatPrice(selectedCargo.basePrice * quantity)}</span>
                    <span>Profit: {Math.round(selectedCargo.basePrice * 0.2 * 100) / 100}</span>
                  </div>
                  <button
                    className={cn(
                      "w-full py-2.5 rounded-lg text-sm font-medium",
                      buyMode
                        ? "bg-cyan-600 text-white active:bg-cyan-700"
                        : "bg-cyan-900/30 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900",
                    )}
                    onClick={() => setBuyMode((b) => !b)}
                  >
                    {buyMode ? "BUY" : "SELL"}
                  </button>
                </div>
              )}

              {/* Tier 3: Market Intel Toggle */}
              {selectedCargoId === cargo.id && marketIntel && (
                <div className="mt-2 pt-2 border-t border-slate-600 space-y-1">
                  <p className="text-xs text-slate-400 font-medium">Market Intel</p>
                  <div className="p-2 bg-cyan-900/30 rounded-md text-xs text-cyan-300/50">
                    <div className="flex justify-between text-[10px]">
                      <span>Galactic Avg:</span>
                      <span>{formatPrice(Math.round(selectedCargo.basePrice * 0.8 / 50) * 50)}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Last Port:</span>
                      <span>Sol (bought @ {formatPrice(selectedCargo.basePrice)})</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Demand:</span>
                      <span>{selectedCargo.demandMod > 0 ? "↑ HIGH DEMAND" : "↓ LOW DEMAND"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Checkbox toggle */}
              {selectedCargoId === cargo.id && (
                <div className="mt-1 pt-1 border-t border-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400/60">
                    <input
                      type="checkbox"
                      checked={marketIntel}
                      onChange={() => setMarketIntel((b) => !b)}
                      className="rounded w-4 h-4 border-2 border-cyan-400 bg-cyan-900/50"
                    />
                    <span>Toggle Market Intel</span>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shipyard Upgrades (mode switch) */}
      {mode === "shipyard-upgrades" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-0 overflow-y-auto">
            <div className="bg-slate-900 rounded-2xl p-6 max-w-sm mx-auto shadow-2xl shadow-black/30">
              <h3 className="text-xl font-bold text-cyan-100 mb-4">Shipyard Upgrades</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Cargo Hold</p>
                  <p className="font-mono text-cyan-100">10 → 20 t +10 capacity</p>
                  <button className="mt-2 py-1 rounded bg-cyan-600 text-white text-sm">Upgrade (500 cr)</button>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Warp Thrusters</p>
                  <p className="font-mono text-cyan-100">Level 1 → 2: +15% speed</p>
                  <button className="mt-2 py-1 rounded bg-cyan-600 text-white text-sm">Upgrade (750 cr)</button>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Scanner Array</p>
                  <p className="font-mono text-cyan-100">Level 1 → 2: -2m scan time</p>
                  <button className="mt-2 py-1 rounded bg-cyan-600 text-white text-sm">Upgrade (600 cr)</button>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Shields</p>
                  <p className="font-mono text-cyan-100">Level 1 → 2: +25% resist</p>
                  <button className="mt-2 py-1 rounded bg-cyan-600 text-white text-sm">Upgrade (800 cr)</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer for additional controls */}
      <Drawer snapPoints={[0.15, 0.35, 0.65]} activeSnapPoint={0.35}>
        <DrawerTrigger asChild>
          <button
            className="w-full py-3 rounded-md bg-cyan-600 text-white text-sm font-medium shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" /> Actions
          </button>
        </DrawerTrigger>
        <DrawerOverlay className="fixed inset-0 z-[50] bg-black/70" />
        <DrawerContent className="max-h-[65vh]">
          <DrawerTitle>Market Controls</DrawerTitle>
          <div className="p-3 space-y-2">
            <button
              className="w-full py-2 rounded-lg text-sm font-medium bg-cyan-900/30 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
            >
              Clear All Selections
            </button>
            <button
              className="w-full py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-700"
            >
              Export Transaction Log
            </button>
          </div>
        </DrawerContent>
        </Drawer>
    </div>
  );
};

const meta: Meta<typeof SpaceportMarket> = {
  title: "Economy/SpaceportMarket",
  component: SpaceportMarket,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "iphone14" },
  },
};

export default meta;
type Story = StoryObj<typeof SpaceportMarket>;

export const TradingTerminal: Story = {
  args: {
    mode: "trading-terminal",
  },
  parameters: {
    docs: {
      description: {
        story:
          "**TradingTerminal**: Header: Credits balance + visual Cargo Hold Capacity Bar (14 / 20 t). Cargo list (5 types: Hydrogen Fuel, Refined Alloys, Bio-Polymers, Quantum Chips, Alien Relics). Tier 1 row: cargo icon, name, current port price, color-coded demand badge. Tier 2 row expanded on tap: -1 / +1 / MAX quantity stepper, total transaction cost/profit preview, [BUY]/[SELL] CTA. Tier 3 'Market Intel' toggle: galactic average price, last-visited port comparison, local supply/demand elasticity.",
      },
    },
  },
};

export const ShipyardUpgrades: Story = {
  args: {
    mode: "shipyard-upgrades",
  },
  parameters: {
    docs: {
      description: {
        story:
          "**ShipyardUpgrades**: Tabbed view inside Spaceport drawer for upgrading Cargo Hold, Warp Thrusters, Scanner Array, and Shields, showing current level → next level stat delta before purchase.",
      },
    },
  },
};