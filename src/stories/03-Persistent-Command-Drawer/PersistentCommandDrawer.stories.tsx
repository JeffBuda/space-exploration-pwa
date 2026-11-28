import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Zap,
  Box,
  Package,
  Cross,
  Target,
  Command,
  Timer,
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  Rocket,
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ELEMENTS, type PeriodicElement } from '@/lib/elements';
import {
  formatCredits,
  calculateWarpEnergyCost,
  calculateTravelTimeSeconds,
  formatDuration,
  RARITY_COLORS,
  RARITY_BG,
} from '@/lib/game';
import { useCadenceClicker } from '@/hooks/useCadenceClicker';

type View = 'route' | 'systems' | 'cargo' | 'market' | 'codex';

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
  type: 'star' | 'planet' | 'moon';
  safety: 'safe' | 'unsafe';
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
  activeView: View;
  route?: string[];
  credits: number;
  energy: number;
  cargoHold: { symbol: string; quantity: number }[];
  codex: CodexState;
  prestige?: { systemsDiscovered: number; planetsDiscovered: number; totalMined: number };
  /** Demo control: treat all bodies as already scanned (used by the Scanned Bodies story). */
  bodiesScanned?: boolean;
}

const EDGES = [
  { from: 'sol', to: 'proxima', distance: 4.2 },
  { from: 'proxima', to: 'epsilon', distance: 2.5 },
  { from: 'epsilon', to: 'kepler', distance: 8.0 },
  { from: 'kepler', to: 'cygnus', distance: 15.0 },
];

const SYSTEMS = [
  {
    id: 'sol',
    name: 'Sol',
    bodies: [
      {
        id: 'sol-star',
        name: 'Sol',
        type: 'star' as const,
        safety: 'safe' as const,
        preScanHints: ['H', 'He', 'C', 'N', 'O'],
        scanned: true,
        minableElements: [],
        landingDuration: 0,
      },
      {
        id: 'mercury',
        name: 'Mercury',
        type: 'planet' as const,
        safety: 'unsafe' as const,
        preScanHints: ['Fe', 'Si', 'Mg'],
        scanned: false,
        minableElements: [
          { symbol: 'Fe', extractionDuration: 3 },
          { symbol: 'Si', extractionDuration: 2 },
          { symbol: 'Mg', extractionDuration: 2 },
        ],
        landingDuration: 30,
      },
      {
        id: 'venus',
        name: 'Venus',
        type: 'planet' as const,
        safety: 'unsafe' as const,
        preScanHints: ['C', 'S', 'Fe'],
        scanned: false,
        minableElements: [
          { symbol: 'C', extractionDuration: 1 },
          { symbol: 'S', extractionDuration: 3 },
          { symbol: 'Fe', extractionDuration: 3 },
        ],
        landingDuration: 45,
      },
      {
        id: 'earth',
        name: 'Earth',
        type: 'planet' as const,
        safety: 'safe' as const,
        preScanHints: ['H', 'O', 'Fe', 'Si', 'Al'],
        scanned: false,
        minableElements: [
          { symbol: 'H', extractionDuration: 1 },
          { symbol: 'O', extractionDuration: 1 },
          { symbol: 'Fe', extractionDuration: 3 },
          { symbol: 'Si', extractionDuration: 2 },
          { symbol: 'Al', extractionDuration: 3 },
        ],
        landingDuration: 20,
      },
      {
        id: 'moon',
        name: 'Moon',
        type: 'moon' as const,
        safety: 'safe' as const,
        preScanHints: ['Si', 'Fe', 'Al', 'Ca', 'Ti'],
        scanned: false,
        minableElements: [
          { symbol: 'Si', extractionDuration: 2 },
          { symbol: 'Fe', extractionDuration: 3 },
          { symbol: 'Al', extractionDuration: 3 },
          { symbol: 'Ca', extractionDuration: 2 },
          { symbol: 'Ti', extractionDuration: 5 },
        ],
        landingDuration: 10,
      },
      {
        id: 'mars',
        name: 'Mars',
        type: 'planet' as const,
        safety: 'safe' as const,
        preScanHints: ['Fe', 'Si', 'Mg', 'Al', 'Ca'],
        scanned: false,
        minableElements: [
          { symbol: 'Fe', extractionDuration: 3 },
          { symbol: 'Si', extractionDuration: 2 },
          { symbol: 'Mg', extractionDuration: 2 },
          { symbol: 'Al', extractionDuration: 3 },
          { symbol: 'Ca', extractionDuration: 2 },
        ],
        landingDuration: 20,
      },
    ] as readonly CelestialBody[],
    hasSpaceport: true,
  },
];

const INITIAL_CODEX: CodexState = {
  discoveredElements: new Set(),
  completed: false,
};

const MARKET_ITEMS = [
  { symbol: 'Au', name: 'Gold', bid: 550, ask: 580 },
  { symbol: 'Fe', name: 'Iron', bid: 55, ask: 65 },
  { symbol: 'He', name: 'Helium', bid: 15, ask: 20 },
  { symbol: 'C', name: 'Carbon', bid: 30, ask: 40 },
];

function buildHops(route: string[] | undefined): RouteHop[] {
  const hopList: RouteHop[] = [];
  if (!route || route.length < 2) return hopList;
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
        distanceLy: edge.distance,
        energyCost: calculateWarpEnergyCost(edge.distance),
        travelTimeSeconds: calculateTravelTimeSeconds(edge.distance),
      });
    }
  }
  return hopList;
}

// ── Route & Transit View ─────────────────────────────────────────────────
function RouteView({
  route: initialRoute = [],
  credits,
  energy: initialEnergy,
}: {
  route?: string[];
  credits: number;
  energy: number;
}) {
  const [route, setRoute] = useState<string[]>(initialRoute);
  const [energy, setEnergy] = useState(initialEnergy);
  const [inTransit, setInTransit] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [currentHopIndex, setCurrentHopIndex] = useState(0);
  const [droppedAt, setDroppedAt] = useState<string | null>(null);

  const hops = useMemo(() => buildHops(route), [route]);
  const totalEnergy = hops.reduce((sum, h) => sum + h.energyCost, 0);
  const totalTime = hops.reduce((sum, h) => sum + h.travelTimeSeconds, 0);
  const insufficientEnergy = totalEnergy > energy;

  const { tap: timeSkipTap, secondsPerTap, comboTier } = useCadenceClicker();

  useEffect(() => {
    if (!inTransit) return;
    const hop = hops[currentHopIndex];
    if (!hop) return;
    const intervalId = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (currentHopIndex < hops.length - 1) {
            setCurrentHopIndex((i) => i + 1);
            const nextHop = hops[currentHopIndex];
            return nextHop ? Math.max(1, nextHop.travelTimeSeconds) : 0;
          }
          setInTransit(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [inTransit, currentHopIndex, hops]);

  const handleEngageWarp = () => {
    if (insufficientEnergy || route.length < 2) return;
    setInTransit(true);
    setCurrentHopIndex(0);
    setRemainingSeconds(hops[0]?.travelTimeSeconds ?? 0);
    setDroppedAt(null);
  };

  // Cancel Hop — drop at nearest star node, consuming the initiated hop's energy
  const handleCancelHop = () => {
    if (!inTransit) return;
    const hop = hops[currentHopIndex];
    const energyCost = hop?.energyCost ?? 0;
    setEnergy((prev) => Math.max(0, prev - energyCost));
    const hopTotal = hop?.travelTimeSeconds ?? 1;
    const progress = hopTotal > 0 ? (hopTotal - remainingSeconds) / hopTotal : 1;
    const dropToDest = progress >= 0.5;
    const dropIndex = dropToDest ? currentHopIndex + 1 : currentHopIndex;
    const newRoute = route.slice(0, dropIndex + 1);
    setRoute(newRoute);
    setDroppedAt(newRoute[newRoute.length - 1] ?? 'unknown');
    setInTransit(false);
    setRemainingSeconds(0);
    setCurrentHopIndex(0);
  };

  const handleTimeSkip = () => {
    const now = Date.now();
    const skip = timeSkipTap(now);
    setRemainingSeconds((prev) => {
      const newRemaining = Math.max(0, prev - skip);
      if (newRemaining === 0 && currentHopIndex < hops.length - 1) {
        const nextHopIndex = currentHopIndex + 1;
        setCurrentHopIndex(nextHopIndex);
        const next = hops[nextHopIndex];
        return next ? next.travelTimeSeconds : 0;
      }
      return newRemaining;
    });
  };

  const handleStarClick = (starId: string) => {
    if (inTransit) return;
    const existingIdx = route.indexOf(starId);
    if (existingIdx >= 0) {
      setRoute(route.slice(0, existingIdx + 1));
      return;
    }
    if (route.length === 0 && starId !== 'sol') return;
    if (route.length > 0 && route[route.length - 1] === starId) return;
    if (route.length > 0) {
      const lastStar = route[route.length - 1];
      const edgeExists = EDGES.some(
        (e) => (e.from === lastStar && e.to === starId) || (e.from === starId && e.to === lastStar)
      );
      if (!edgeExists) return;
    }
    setRoute([...route, starId]);
  };

  const isRouteValid = route.length > 0 && route[0] === 'sol';

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-sm font-semibold text-secondary-foreground">Route & Transit</h2>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground">Active Route</span>
        <span
          className={cn(
            'font-mono text-[10px]',
            isRouteValid ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {route.length > 0 ? route.join(' → ') : '—'}
        </span>
      </div>

      {inTransit ? (
        <div className="space-y-2 rounded-lg border border-primary/30 bg-secondary/20 p-3">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-secondary-foreground">Hop Remaining</span>
            <span className="font-mono text-foreground">{formatDuration(remainingSeconds)}</span>
          </div>
          <div className="bg-surface h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="h-full bg-gradient-to-r from-primary to-success transition-all duration-1000"
              style={{
                width: `${Math.max(0, ((totalTime - remainingSeconds) / totalTime) * 100)}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              className="flex-1 rounded-lg border border-danger/50 py-2 text-sm font-medium text-danger hover:bg-danger-bg/20 active:bg-danger/30"
              onClick={handleCancelHop}
              disabled={remainingSeconds <= 0}
            >
              <Cross className="mr-1 h-4 w-4" /> Cancel Hop
              {droppedAt && (
                <span className="ml-1 text-[10px] text-danger">Dropped at {droppedAt}</span>
              )}
            </button>
            <button
              className="flex-1 rounded-lg bg-gradient-to-br from-primary to-primary-active py-2 text-sm font-medium text-primary-foreground shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform active:scale-95"
              onClick={handleTimeSkip}
            >
              <Zap className="mr-1 h-4 w-4" /> Time-Skip{' '}
              <span className="ml-2 font-mono text-xs text-success">
                {comboTier <= 0 ? '1x / -1s' : `${comboTier}x / -${secondsPerTap}s`}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {route.length > 1 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/50 bg-background/30 p-2">
                <p className="mb-1 text-[10px] text-muted-foreground">Energy Cost</p>
                <span
                  className={cn(
                    'font-mono text-xs',
                    insufficientEnergy ? 'text-danger' : 'text-secondary-foreground'
                  )}
                >
                  {totalEnergy}
                </span>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/30 p-2">
                <p className="mb-1 text-[10px] text-muted-foreground">Travel Time</p>
                <span className="font-mono text-xs text-secondary-foreground">
                  {formatDuration(totalTime)}
                </span>
              </div>
            </div>
          )}
          <div className="space-y-2 border-t border-border/50 pt-3">
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground">Energy</p>
                <span className="font-mono font-bold text-secondary-foreground">{energy}</span>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Needed</p>
                <span
                  className={cn(
                    'font-mono text-xs',
                    totalEnergy > energy ? 'text-danger' : 'text-secondary-foreground'
                  )}
                >
                  {totalEnergy}
                </span>
              </div>
            </div>
            {totalEnergy > energy && (
              <p className="text-[10px] text-danger">Insufficient Energy — Engage Warp disabled</p>
            )}
            <button
              className={cn(
                'w-full rounded-lg py-2.5 text-sm font-medium shadow-lg shadow-primary/30',
                insufficientEnergy
                  ? 'cursor-not-allowed border border-primary/50 bg-secondary/30 text-secondary-foreground opacity-50'
                  : 'bg-primary text-primary-foreground active:bg-primary-active'
              )}
              disabled={insufficientEnergy}
              onClick={handleEngageWarp}
            >
              <Command className="mr-1 h-4 w-4" /> Engage Warp
              {insufficientEnergy && (
                <span className="ml-1 text-[10px] text-danger">Insufficient Energy</span>
              )}
            </button>
            <button
              className="w-full rounded-lg border border-secondary/50 bg-secondary/30 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary-hover/30 active:bg-secondary-active"
              onClick={() => setRoute([])}
            >
              <Cross className="mr-1 h-4 w-4" /> Clear Route
            </button>
            {route.length > 1 && (
              <button
                className="w-full rounded-lg border border-secondary/50 bg-secondary/30 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary-hover/30 active:bg-secondary-active"
                onClick={() => setRoute([])}
              >
                <Cross className="mr-1 h-4 w-4" /> Cancel Hop
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── System & Bodies View ─────────────────────────────────────────────────
function SystemsView({ bodiesScanned = false }: { bodiesScanned?: boolean }) {
  const system = SYSTEMS[0];
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [scanRemaining, setScanRemaining] = useState(0);
  const [scannedIds, setScannedIds] = useState<Set<string>>(
    new Set(bodiesScanned ? system.bodies.map((b) => b.id) : [])
  );
  const {
    tap: scanTap,
    secondsPerTap: scanSecondsPerTap,
    comboTier: scanCombo,
  } = useCadenceClicker();

  // Scan timer
  useEffect(() => {
    if (!scanningId) return;
    const intervalId = window.setInterval(() => {
      setScanRemaining((prev) => {
        if (prev <= 1) {
          setScanningId(null);
          setScannedIds((s) => new Set(s).add(scanningId));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [scanningId]);

  const handleScanBody = (body: CelestialBody) => {
    setScanningId(body.id);
    setScanRemaining(body.landingDuration); // mock scan duration
  };

  const handleScanSkip = () => {
    const now = Date.now();
    const skip = scanTap(now);
    setScanRemaining((prev) => Math.max(0, prev - skip));
  };

  const handleLand = (body: CelestialBody) => {
    // Soft-failure: unsafe bodies are not a Game Over — they trigger recovery
    // (see UnsafePlanetModal). Safe bodies simply land.
    console.log('Landed on', body.name);
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-sm font-semibold text-secondary-foreground">System & Bodies</h2>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-muted-foreground">System</p>
          <p className="font-mono text-foreground">{system.name}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Spaceport</p>
          <p
            className={cn(
              'font-mono text-xs',
              system.hasSpaceport ? 'text-success' : 'text-danger/50'
            )}
          >
            {system.hasSpaceport ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {system.bodies.map((body: CelestialBody) => {
          const isScanned = scannedIds.has(body.id) || body.scanned;
          const isUnsafe = body.safety === 'unsafe';
          const safetyColor = isUnsafe ? 'text-danger' : 'text-success';
          const safetyLabel = isUnsafe ? 'Unsafe' : 'Safe';

          return (
            <div
              key={body.id}
              className={cn(
                'space-y-1 rounded-lg border p-3',
                isUnsafe ? 'border-danger' : 'border-success-border'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-3 w-3 rounded-md',
                      body.type === 'star'
                        ? 'bg-yellow-400'
                        : body.type === 'planet'
                          ? 'bg-orange-400'
                          : 'bg-blue-400'
                    )}
                  />
                  <span className="font-medium text-foreground">{body.name}</span>
                </div>
                <span className={cn('text-[10px] font-medium', safetyColor)}>{safetyLabel}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-secondary-foreground/60">
                <div>
                  <p className="mb-0.5">Hints</p>
                  <p>{body.preScanHints.slice(0, 3).join(', ')}</p>
                </div>
                <div>
                  <p className="mb-0.5">Scan</p>
                  {isScanned ? (
                    <span className="font-mono text-success">Scanned</span>
                  ) : scanningId === body.id ? (
                    <span className="font-mono text-secondary-foreground">
                      {formatDuration(scanRemaining)}
                    </span>
                  ) : (
                    <button
                      className="w-full rounded-lg border border-secondary/50 bg-secondary/30 py-2 text-[10px] font-medium text-secondary-foreground hover:bg-secondary-hover/30 active:bg-secondary-active"
                      onClick={() => handleScanBody(body)}
                    >
                      Scan Body
                    </button>
                  )}
                  {scanningId === body.id && (
                    <div className="mt-1 flex gap-2">
                      <button
                        className="flex-1 rounded-lg bg-gradient-to-br from-primary to-primary-active py-1.5 text-[10px] font-medium text-primary-foreground shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform active:scale-95"
                        onClick={handleScanSkip}
                      >
                        <Timer className="mr-1 h-3 w-3" /> Time-Skip{' '}
                        <span className="ml-1 font-mono text-[10px] text-success">
                          {scanCombo <= 0 ? '1x / -1s' : `${scanCombo}x / -${scanSecondsPerTap}s`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isScanned && (
                <div className="mt-2 rounded-lg border border-secondary bg-secondary/20 p-2">
                  <p className="text-[10px] text-secondary-foreground/60">Minable Elements</p>
                  {body.minableElements.length > 0 ? (
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      {body.minableElements.map((el) => {
                        const element = ELEMENTS.find((e) => e.symbol === el.symbol);
                        return (
                          <div
                            key={el.symbol}
                            className={cn(
                              'flex items-center gap-1 rounded-lg border p-1',
                              `border-${element?.rarity}-700/30 ${RARITY_BG[element?.rarity ?? 'common']}`
                            )}
                          >
                            <span
                              className={cn(
                                'font-mono font-bold',
                                RARITY_COLORS[element?.rarity ?? 'common']
                              )}
                            >
                              {element?.symbol || el.symbol}
                            </span>
                            <span
                              className={cn(
                                'font-mono text-xs',
                                RARITY_COLORS[element?.rarity ?? 'common']
                              )}
                            >
                              {el.extractionDuration}s
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground/60">None</p>
                  )}
                </div>
              )}

              {!body.scanned && !isScanned && !isUnsafe ? (
                <div className="mt-2 text-[10px] text-muted-foreground/60">
                  Scan body to reveal exact minable elements and cycle durations.
                </div>
              ) : null}

              <div className="mt-2">
                <button
                  className={cn(
                    'w-full rounded py-2 text-xs font-medium',
                    isUnsafe
                      ? 'cursor-not-allowed border border-danger-border bg-danger-bg/30 text-danger opacity-70 hover:bg-danger-bg/30'
                      : 'bg-primary text-primary-foreground active:bg-primary-active'
                  )}
                  disabled={isUnsafe || body.type === 'star'}
                  onClick={() => handleLand(body)}
                >
                  {isUnsafe
                    ? '⚠ Unsafe — Soft Fail'
                    : body.type === 'star'
                      ? 'Star (no landing)'
                      : 'Land'}
                </button>
                {isUnsafe && (
                  <p className="mt-1 text-[10px] text-danger/70">
                    Soft-failure recovery: ship destroyed, cargo wiped, towed back to previous
                    Spaceport (no Game Over reset).
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Cargo Hold View ──────────────────────────────────────────────────────
function CargoView({
  cargoHold: initialCargoHold,
  codex,
  prestige,
}: {
  cargoHold: { symbol: string; quantity: number }[];
  codex: CodexState;
  prestige?: PersistentCommandDrawerProps['prestige'];
}) {
  const [cargo, setCargo] = useState<{ symbol: string; quantity: number }[]>(initialCargoHold);
  const [miningElement, setMiningElement] = useState<PeriodicElement | null>(null);
  const [cycleRemaining, setCycleRemaining] = useState(0);
  const [unitsMinedThisSession, setUnitsMinedThisSession] = useState(0);
  const {
    tap: mineTap,
    secondsPerTap: mineSecondsPerTap,
    comboTier: mineCombo,
  } = useCadenceClicker();

  // Continuous background idle mining timer — accumulates units every cycle
  useEffect(() => {
    if (!miningElement || cycleRemaining <= 0) return;
    const intervalId = window.setInterval(() => {
      setCycleRemaining((prev) => {
        if (prev <= 1) {
          setUnitsMinedThisSession((u) => u + 1);
          const duration = miningElement.extractionDuration;
          return duration; // start next cycle immediately
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [miningElement, cycleRemaining]);

  const handleStartMining = (element: PeriodicElement) => {
    setMiningElement(element);
    setCycleRemaining(element.extractionDuration);
  };

  const handleSwitchElement = (element: PeriodicElement) => {
    // Switching element resets the active cycle; cargo keeps accumulated units
    setMiningElement(element);
    setCycleRemaining(element.extractionDuration);
  };

  const handleMineSkip = () => {
    const now = Date.now();
    const skip = mineTap(now);
    if (!miningElement) return;
    const cycle = miningElement.extractionDuration;
    setCycleRemaining((prev) => {
      const gained = Math.floor((prev + skip) / cycle);
      if (gained > 0) {
        setUnitsMinedThisSession((u) => u + gained);
        setCargo((cur) => {
          const next = [...cur];
          const el = ELEMENTS.find((e) => e.symbol === miningElement.symbol);
          if (el) {
            const idx = next.findIndex((s) => s.symbol === el.symbol);
            if (idx >= 0) next[idx].quantity += gained;
            else next.push({ symbol: el.symbol, quantity: gained });
          }
          return next;
        });
      }
      return (prev + skip) % cycle;
    });
  };

  const elementSymbol = miningElement?.symbol;
  const currentElement = ELEMENTS.find((e) => e.symbol === elementSymbol);

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-sm font-semibold text-secondary-foreground">Cargo Hold (Unlimited)</h2>

      <div className="max-h-[40vh] space-y-3 overflow-y-auto">
        {cargo.length === 0 && (
          <p className="py-4 text-center text-[10px] text-muted-foreground">Empty hold</p>
        )}
        {cargo.map((slot) => {
          const element = ELEMENTS.find((e) => e.symbol === slot.symbol);
          if (!element) return null;
          return (
            <div
              key={element.atomicNumber}
              className={cn(
                'flex items-center justify-between rounded-lg border p-3',
                'border-border/50 bg-background/20',
                `border-${element.rarity}-700/30 ${RARITY_BG[element.rarity]}`
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                  <span className={cn('font-mono font-bold', RARITY_COLORS[element.rarity])}>
                    {element.symbol}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{element.name}</p>
                  <p className="text-xs text-muted-foreground/60">{slot.quantity}</p>
                </div>
                <span className="font-mono text-xs text-secondary-foreground">{slot.quantity}</span>
              </div>
              <div className="mt-2 text-[10px] text-secondary-foreground/60">
                <p className="text-[10px] text-secondary-foreground">
                  Value: {formatCredits(element.baselineValue * slot.quantity)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 space-y-3 rounded-lg border border-secondary bg-secondary/10 p-3">
        <p className="mb-2 text-[10px] font-medium text-secondary-foreground">Mine Element</p>
        <div className="max-h-[180px] space-y-1 overflow-y-auto">
          {ELEMENTS.slice(0, 20).map((element) => {
            const rc = RARITY_COLORS[element.rarity];
            const isActive = miningElement?.symbol === element.symbol;
            return (
              <button
                key={element.symbol}
                onClick={() =>
                  isActive && miningElement?.symbol === element.symbol
                    ? null
                    : handleStartMining(element)
                }
                className={cn(
                  'flex flex-col items-center gap-1 rounded border px-2 py-1 text-[10px]',
                  `border-${element.rarity}-700/30 bg-background/20`,
                  isActive ? 'border-primary bg-secondary/40 text-foreground' : 'text-rarity-common'
                )}
              >
                <span className={cn('font-mono font-bold', rc)}>{element.symbol}</span>
                <span className="text-[10px] text-secondary-foreground/60">
                  {element.extractionDuration}s
                </span>
              </button>
            );
          })}
        </div>

        {miningElement ? (
          <div className="space-y-2 border-t border-secondary pt-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className={cn('font-medium', RARITY_COLORS[miningElement.rarity])}>
                {miningElement.name} ({miningElement.symbol})
              </span>
              <span className="font-mono text-secondary-foreground">
                +1 / {miningElement.extractionDuration}s · {unitsMinedThisSession} units mined
              </span>
            </div>
            <div className="bg-surface h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full bg-gradient-to-r from-primary to-success transition-all duration-1000"
                style={{
                  width: `${Math.max(
                    0,
                    ((miningElement.extractionDuration - cycleRemaining) /
                      miningElement.extractionDuration) *
                      100
                  )}%`,
                }}
              />
            </div>
            <button
              className="w-full rounded-lg bg-gradient-to-br from-primary to-primary-active py-1.5 text-[10px] font-medium text-primary-foreground shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform active:scale-95"
              onClick={handleMineSkip}
            >
              <Zap className="mr-1 h-3 w-3" /> Time-Skip{' '}
              <span className="ml-1 font-mono text-[10px] text-success">
                {mineCombo <= 0 ? '1x / -1s' : `${mineCombo}x / -${mineSecondsPerTap}s`}
              </span>
            </button>
          </div>
        ) : (
          <p className="mt-2 text-center text-[10px] text-muted-foreground/60">
            Select an element to begin continuous background idle mining.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Spaceport Market View ────────────────────────────────────────────────
function MarketView({ cargoHold }: { cargoHold: { symbol: string; quantity: number }[] }) {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-sm font-semibold text-secondary-foreground">Spaceport Market</h2>
      <p className="mb-3 text-[10px] text-secondary-foreground">
        Static seeded Bid/Ask prices for Periodic Table elements. Precalculated at world creation —
        never fluctuate dynamically.
      </p>
      <div className="mb-4 grid grid-cols-2 gap-3">
        {MARKET_ITEMS.map((el) => {
          const element = ELEMENTS.find((e) => e.symbol === el.symbol);
          const rc = element ? RARITY_COLORS[element.rarity] : 'text-rarity-common';
          return (
            <div
              key={el.symbol}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-background p-3 hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/30">
                  <span className={cn('font-mono font-bold', rc)}>{el.symbol}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{el.name}</p>
                  <p className="text-xs text-muted-foreground/60">t</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-sm font-medium text-secondary-foreground">
                    {formatCredits(el.bid)}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">bid</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-sm font-medium text-warning">{formatCredits(el.ask)}</p>
                  <p className="text-[10px] text-muted-foreground/60">ask</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-3">
        <button
          className="w-full rounded-lg border border-secondary/50 bg-secondary/30 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary-hover/30 active:bg-secondary-active"
          onClick={() => {}}
        >
          Buy Selected
        </button>
        <button
          className="w-full rounded-lg border border-secondary/50 bg-secondary/30 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary-hover/30 active:bg-secondary-active"
          onClick={() => {}}
        >
          Sell Selected
        </button>
      </div>
    </div>
  );
}

// ── Periodic Discovery Codex View ────────────────────────────────────────
function CodexView({
  codex: initialCodex,
  prestige,
}: {
  codex: CodexState;
  prestige?: PersistentCommandDrawerProps['prestige'];
}) {
  const [discovered, setDiscovered] = useState<Set<number>>(
    new Set(initialCodex.discoveredElements)
  );
  const [completed, setCompleted] = useState(initialCodex.completed);
  const [victory, setVictory] = useState(false);
  const [demoStage, setDemoStage] = useState<'mid' | 'near' | null>(null); // storybook demo presets

  const handleDiscoveryDemo = (stage: 'mid' | 'near') => {
    setDemoStage(stage);
    if (stage === 'mid') {
      const ids = new Set([1, 2, 6, 7, 8, 9, 16, 17, 26, 27, 28, 47, 53, 79, 80, 82]);
      setDiscovered(ids);
      setCompleted(false);
    } else {
      // Near-complete: all but Oganesson (118)
      const ids = new Set(ELEMENTS.map((e) => e.atomicNumber).filter((n) => n !== 118));
      setDiscovered(ids);
      setCompleted(false);
    }
  };

  const handleDiscoverElement = (atomicNumber: number) => {
    if (completed) return;
    const next = new Set(discovered);
    next.add(atomicNumber);
    setDiscovered(next);
    if (next.size >= 118) {
      setCompleted(true);
      setVictory(true);
    }
  };

  // Codex state is initialized from props at mount (Storybook arg changes after mount
  // are not applied — acceptable for storyboard demos).
  void initialCodex;

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-sm font-semibold text-secondary-foreground">Discovery Codex</h2>

      <div className="grid grid-cols-2 gap-2 text-[10px] text-secondary-foreground">
        <div>
          <p className="mb-1 text-[10px] font-medium">Discovered</p>
          <p className="font-mono text-foreground">{discovered.size}</p>
          <p className="text-[10px] text-muted-foreground/60">/ 118</p>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-medium">Completed</p>
          <p className={cn('text-primary', completed ? '' : 'text-muted-foreground/60')}>
            {completed ? 'YES' : 'NO'}
          </p>
        </div>
      </div>

      {completed && !victory && (
        <div className="mb-3 rounded-lg border border-rarity-legendary bg-rarity-legendary/10 p-3">
          <p className="text-[10px] font-medium text-rarity-legendary">
            ENDLESS PLAY MODE UNLOCKED
          </p>
        </div>
      )}

      {/* Prestige counters */}
      {prestige && (
        <div className="mb-3 mt-1 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-secondary bg-secondary/20 p-2">
            <p className="text-[10px] font-medium text-secondary-foreground">Systems Discovered</p>
            <p className="font-mono text-lg text-foreground">{prestige.systemsDiscovered}</p>
          </div>
          <div className="rounded-lg border border-secondary bg-secondary/20 p-2">
            <p className="text-[10px] font-medium text-secondary-foreground">Planets Discovered</p>
            <p className="font-mono text-lg text-foreground">{prestige.planetsDiscovered}</p>
          </div>
          <div className="rounded-lg border border-secondary bg-secondary/20 p-2">
            <p className="text-[10px] font-medium text-secondary-foreground">
              Total Resources Mined
            </p>
            <p className="font-mono text-lg text-foreground">{prestige.totalMined}</p>
          </div>
        </div>
      )}

      {/* Storybook demo presets — drive the interactive grid states */}
      <div className="space-y-1 border-t border-border/50 pt-3">
        <p className="mb-1 text-[10px] font-medium text-muted-foreground">Demo presets</p>
        <div className="flex gap-2">
          <button
            onClick={() => handleDiscoveryDemo('mid')}
            className="flex-1 rounded-lg border border-secondary/50 bg-secondary/30 py-1.5 text-[10px] font-medium text-secondary-foreground hover:bg-secondary-hover/30"
          >
            Mid-run (14 / 118)
          </button>
          <button
            onClick={() => handleDiscoveryDemo('near')}
            className="flex-1 rounded-lg border border-warning/50 bg-warning-bg/30 py-1.5 text-[10px] font-medium text-warning hover:bg-warning-bg/30"
          >
            Near-complete (117 / 118)
          </button>
        </div>
      </div>

      <div className="mt-3">
        <p className="mb-2 text-[10px] font-medium text-secondary-foreground/60">Discovery Grid</p>
        <div className="grid max-h-[300px] grid-cols-4 gap-1 overflow-y-auto">
          {ELEMENTS.map((element) => {
            const isDiscovered = discovered.has(element.atomicNumber);
            const rc = RARITY_COLORS[element.rarity];
            return (
              <button
                key={element.symbol}
                onClick={() => handleDiscoverElement(element.atomicNumber)}
                className={cn(
                  'flex items-center justify-center rounded-lg border p-1 text-[10px]',
                  isDiscovered
                    ? 'border-primary/50 bg-primary/20'
                    : 'border-border/50 bg-background/30',
                  isDiscovered ? rc : 'text-muted-foreground'
                )}
              >
                <span className={cn('font-mono font-bold', rc)}>{element.symbol}</span>
              </button>
            );
          })}
        </div>
      </div>

      {victory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-3 rounded-2xl bg-[hsl(var(--card))] p-6 shadow-2xl shadow-black/30">
            <h2 className="text-xl font-bold text-success">
              <Target className="mr-2 h-5 w-5" /> Codex Complete
            </h2>
            <p className="text-center text-2xl font-bold text-success">
              All 118 Elements Discovered!
            </p>
            <p className="text-center text-[10px] text-secondary-foreground/60">
              Endless Play Mode Unlocked
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setVictory(false)}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground active:bg-primary-active"
              >
                <Rocket className="mr-1 h-4 w-4" /> Continue Endless Play
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Drawer ──────────────────────────────────────────────────────────
const PersistentCommandDrawer = ({
  activeView: initialActiveView,
  route: initialRoute,
  credits,
  energy,
  cargoHold,
  codex,
  prestige,
  bodiesScanned,
}: PersistentCommandDrawerProps) => {
  const [activeView, setActiveView] = useState<View>(initialActiveView);
  const viewOrder: View[] = ['route', 'systems', 'cargo', 'market', 'codex'];
  const viewIndex = viewOrder.indexOf(activeView);

  const viewLabel: Record<View, string> = {
    route: 'Route & Transit',
    systems: 'System & Bodies',
    cargo: 'Cargo Hold',
    market: 'Spaceport Market',
    codex: 'Discovery Codex',
  };

  return (
    <Drawer snapPoints={[0.15, 0.35, 0.65]} activeSnapPoint={0.35}>
      <DrawerTrigger asChild>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30"
          onClick={() => {
            const next = viewOrder[(viewIndex + 1) % viewOrder.length];
            setActiveView(next);
          }}
        >
          <Zap className="h-4 w-4" /> {viewLabel[activeView]}
        </button>
      </DrawerTrigger>
      <DrawerOverlay className="fixed inset-0 z-[50] bg-black/70" />
      <DrawerContent className="max-h-[65vh] space-y-4 p-4">
        <DrawerTitle>{viewLabel[activeView]}</DrawerTitle>

        {activeView === 'route' && (
          <RouteView route={initialRoute} credits={credits} energy={energy} />
        )}
        {activeView === 'systems' && <SystemsView bodiesScanned={bodiesScanned} />}
        {activeView === 'cargo' && (
          <CargoView cargoHold={cargoHold} codex={codex} prestige={prestige} />
        )}
        {activeView === 'market' && <MarketView cargoHold={cargoHold} />}
        {activeView === 'codex' && <CodexView codex={codex} prestige={prestige} />}
      </DrawerContent>
    </Drawer>
  );
};

const meta: Meta<typeof PersistentCommandDrawer> = {
  title: '03-Persistent-Command-Drawer/PersistentCommandDrawer',
  component: PersistentCommandDrawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'iphone14' },
  },
};

export default meta;
type Story = StoryObj<typeof PersistentCommandDrawer>;

// ── Story exports with numeric ordering ──
export const _01_NavigationAndClicker: Story = {
  name: '01_NavigationAndClicker',
  args: {
    activeView: 'route' as const,
    credits: 100,
    energy: 100,
    cargoHold: [],
    codex: INITIAL_CODEX,
    route: ['sol', 'proxima', 'epsilon', 'kepler'],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Plotted multi-hop itinerary (Sol → Proxima → Epsilon → Kepler), Energy/time totals, Engage/Cancel controls, and interactive Exponential Time-Skip Clicker (`-1s` scaling exponentially with click cadence).',
      },
    },
  },
};

export const _02_SystemBodiesPreScanHints: Story = {
  name: '02_SystemBodiesPreScanHints',
  args: {
    activeView: 'systems' as const,
    credits: 100,
    energy: 100,
    cargoHold: [],
    codex: INITIAL_CODEX,
    bodiesScanned: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Small list of stars, planets, and moons in the current system displaying pre-scan resource hints and Scan Body action. Shows Safe vs. Unsafe classification with scan timer and cadence-scaling Time-Skip acceleration.',
      },
    },
  },
};

export const _03_ScannedBodiesAndUnsafeWarning: Story = {
  name: '03_ScannedBodiesAndUnsafeWarning',
  args: {
    activeView: 'systems' as const,
    credits: 100,
    energy: 100,
    cargoHold: [],
    codex: INITIAL_CODEX,
    bodiesScanned: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Post-scan view showing Safe bodies vs. Unsafe planet hazard warnings with exact minable elements and per-element cycle durations. Unsafe landing is soft-failure recovery (no Game Over).',
      },
    },
  },
};

export const _04_LandedContinuousIdleMining: Story = {
  name: '04_LandedContinuousIdleMining',
  args: {
    activeView: 'cargo' as const,
    credits: 100,
    energy: 100,
    cargoHold: [
      { symbol: 'Fe', quantity: 5 },
      { symbol: 'Si', quantity: 3 },
    ],
    codex: INITIAL_CODEX,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Landed surface view allowing selection of one Periodic Table element with per-element cycle duration, running continuous background idle mining with active clicker time-skip acceleration. Cargo Hold is unlimited.',
      },
    },
  },
};

export const _05_CargoHoldUnlimited: Story = {
  name: '05_CargoHoldUnlimited',
  args: {
    activeView: 'cargo' as const,
    credits: 100,
    energy: 100,
    cargoHold: [
      { symbol: 'Au', quantity: 5 },
      { symbol: 'Fe', quantity: 20 },
      { symbol: 'He', quantity: 10 },
    ],
    codex: INITIAL_CODEX,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Unlimited Cargo Hold inventory list showing collected Periodic Table elements (symbol, name, quantity). Cargo Hold is unlimited in the MVP — no capacity caps.',
      },
    },
  },
};

export const _06_SpaceportMarketArbitrage: Story = {
  name: '06_SpaceportMarketArbitrage',
  args: {
    activeView: 'market' as const,
    credits: 100,
    energy: 100,
    cargoHold: [{ symbol: 'Au', quantity: 5 }],
    codex: INITIAL_CODEX,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Docked at a Spaceport (Sol or ~10% safe system port) showing static precalculated Bid/Ask integer Credit order book for buying and selling Periodic Table elements.',
      },
    },
  },
};

export const _07_PeriodicDiscoveryCodex: Story = {
  name: '07_PeriodicDiscoveryCodex',
  args: {
    activeView: 'codex' as const,
    credits: 100,
    energy: 100,
    cargoHold: [{ symbol: 'Au', quantity: 5 }],
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
          '118-element Periodic Table discovery grid showing discovered vs. undiscovered elements (mid-run `14 / 118`), near-complete state (`117 / 118`), discovering the 118th triggers VictoryCodexModal and unlocks Endless Play Mode, plus cumulative Prestige counters (Systems Discovered, Planets Discovered, Total Resources Mined).',
      },
    },
  },
};
