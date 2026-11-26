import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Zap, Box, Package, Shield, Rocket, Plus, Cross, Command } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ELEMENTS, type PeriodicElement, type ElementRarity } from '@/lib/elements';
import {
  formatCredits,
  calculateWarpEnergyCost,
  calculateTravelTimeSeconds,
  RARITY_COLORS,
  RARITY_RING,
} from '@/lib/game';

interface CargoSlot {
  symbol: string;
  quantity: number;
}

interface GameState {
  credits: number;
  energy: number;
  cargoHold: CargoSlot[];
  discoveredElements: Set<number>;
}

const INITIAL_STATE: GameState = {
  credits: 0,
  energy: 1000,
  cargoHold: [],
  discoveredElements: new Set(),
};

function addToCargo(state: GameState, element: PeriodicElement, quantity: number): GameState {
  const existingIndex = state.cargoHold.findIndex((s) => s.symbol === element.symbol);
  const newCargo = [...state.cargoHold];
  if (existingIndex >= 0) {
    newCargo[existingIndex] = {
      ...newCargo[existingIndex],
      quantity: newCargo[existingIndex].quantity + quantity,
    };
  } else {
    newCargo.push({ symbol: element.symbol, quantity });
  }
  const newDiscovered = new Set(state.discoveredElements);
  newDiscovered.add(element.atomicNumber);
  return { ...state, cargoHold: newCargo, discoveredElements: newDiscovered };
}

function consumeEnergy(state: GameState, amount: number): GameState {
  return { ...state, energy: Math.max(0, state.energy - amount) };
}

function addCredits(state: GameState, amount: number): GameState {
  return { ...state, credits: Math.floor(state.credits + amount) };
}

export const App = () => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [selectedElement, setSelectedElement] = useState<PeriodicElement | null>(null);

  const totalElements = state.discoveredElements.size;
  const codexComplete = totalElements >= 118;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0d1117]">
      {/* Top HUD */}
      <div className="fixed left-0 right-0 top-0 z-10 mx-auto max-w-[430px] border-b border-slate-600 bg-slate-900 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-600/20">
              <Rocket className="h-3 w-3 text-cyan-400" />
            </div>
            <h2 className="text-sm font-bold text-cyan-100">Sol System</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Box className="h-4 w-4 text-yellow-400" />
              <span className="font-mono font-bold text-yellow-300">
                {formatCredits(state.credits)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="font-mono font-bold text-cyan-300">{state.energy}</span>
            </div>
            <button
              className="flex-shrink-0 rounded-lg p-1 text-cyan-200/60 transition-colors hover:bg-cyan-900/30"
              aria-label="Settings"
            >
              <Shield className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main map area placeholder */}
      <div className="absolute inset-0 h-full w-full opacity-[0.03]">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="none" stroke="currentColor" stroke-width="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Drawer */}
      <Drawer snapPoints={[0.15, 0.35, 0.65]} activeSnapPoint={0.35}>
        <DrawerTrigger asChild>
          <button className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-600 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-600/30">
            <Zap className="h-4 w-4" /> Actions
          </button>
        </DrawerTrigger>
        <DrawerOverlay className="fixed inset-0 z-[50] bg-black/70" />
        <DrawerContent className="max-h-[65vh]">
          <DrawerTitle>Command Drawer</DrawerTitle>
          <div className="space-y-3 p-3">
            {/* Cargo Hold */}
            <div className="space-y-2">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-cyan-300">Cargo Hold (Unlimited)</p>
                <span className="text-[10px] text-slate-400">
                  {state.cargoHold.reduce((s, c) => s + c.quantity, 0)} units
                </span>
              </div>
              {state.cargoHold.length === 0 ? (
                <p className="py-2 text-center text-xs text-slate-500">Empty hold</p>
              ) : (
                <div className="space-y-1">
                  {state.cargoHold.map((slot) => {
                    const element = ELEMENTS.find((e) => e.symbol === slot.symbol);
                    if (!element) return null;
                    return (
                      <div
                        key={element.symbol}
                        className={cn(
                          'flex items-center justify-between rounded-lg border p-2',
                          'border-slate-600/50 bg-slate-900/20'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn('font-mono text-xs', RARITY_COLORS[element.rarity])}>
                            {element.symbol}
                          </span>
                          <span className="text-xs text-cyan-100">{element.name}</span>
                        </div>
                        <span className="font-mono text-xs text-cyan-200">{slot.quantity}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Element selector for mining */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-cyan-300">Mine Element</p>
              <div className="flex max-h-[150px] flex-wrap gap-1 overflow-y-auto">
                {ELEMENTS.map((element) => (
                  <button
                    key={element.symbol}
                    onClick={() =>
                      setSelectedElement(
                        selectedElement?.symbol === element.symbol ? null : element
                      )
                    }
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px]',
                      selectedElement?.symbol === element.symbol
                        ? RARITY_RING[element.rarity] +
                            ' border-cyan-500/80 bg-cyan-900/40 text-cyan-100'
                        : 'border-slate-600/50 bg-slate-900/20 text-slate-300 hover:border-cyan-500/30'
                    )}
                  >
                    <span className={cn('font-mono font-bold', RARITY_COLORS[element.rarity])}>
                      {element.symbol}
                    </span>
                    <span
                      className={
                        selectedElement?.symbol === element.symbol
                          ? 'text-cyan-400'
                          : 'text-slate-500'
                      }
                    >
                      +{element.baselineValue}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-3 space-y-2">
              <button
                className="w-full rounded-lg bg-cyan-600 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-600/30 active:bg-cyan-700"
                onClick={() => {
                  if (!selectedElement) return;
                  const cost = calculateWarpEnergyCost(1);
                  if (state.energy < cost) return;
                  setState((s) =>
                    addToCargo(
                      consumeEnergy(
                        addCredits(s, Math.floor(selectedElement.baselineValue * 0.5)),
                        cost
                      ),
                      selectedElement,
                      1
                    )
                  );
                  setSelectedElement(null);
                }}
              >
                <Package className="mr-1 h-4 w-4" /> Mine Selected Element
              </button>
              <button
                className="w-full rounded-lg border border-cyan-700/50 bg-cyan-900/30 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
                onClick={() => setState((s) => ({ ...s, energy: Math.min(1000, s.energy + 100) }))}
              >
                <Zap className="mr-1 h-4 w-4" /> Recharge Energy (+100)
              </button>
            </div>

            {/* Codex progress */}
            <div className="mt-3 rounded-lg border border-slate-600/50 bg-slate-900/20 p-2">
              <p className="mb-1 text-xs font-medium text-cyan-300">Discovery Codex</p>
              <div className="flex items-baseline gap-1 text-[10px] text-cyan-200">
                <span>{totalElements}</span>
                <span className="text-slate-500">/ 118</span>
              </div>
              {codexComplete && (
                <p className="mt-1 text-[10px] font-medium text-yellow-400">
                  CODEX COMPLETE — ENDLESS PLAY MODE UNLOCKED
                </p>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default App;
