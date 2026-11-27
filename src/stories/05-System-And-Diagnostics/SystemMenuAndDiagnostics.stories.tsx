import type { Meta, StoryObj } from '@storybook/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Terminal,
  Wrench,
  Download,
  Upload,
  Trash2,
  Filter,
  Copy,
  Rocket,
  AlertTriangle,
  Smartphone,
} from 'lucide-react';
import { formatCredits, INITIAL_CREDITS, INITIAL_ENERGY } from '@/lib/game';
import { ELEMENTS } from '@/lib/elements';

interface DiagnosticState {
  versionTaps: number;
  hasTriggeredDebug: boolean;
}

const INITIAL_STATE_DIAG: DiagnosticState = {
  versionTaps: 0,
  hasTriggeredDebug: false,
};

// ── Mock log entries ────────────────────────────────────────────────────
const MOCK_LOGS = [
  {
    id: '1',
    timestamp: '2024-01-15T10:30:00.123Z',
    level: 'ENGINE',
    action: 'WARP_INITIATE',
    executionTimeMs: 45,
    stateDiff: {
      location: 'Sol → Proxima',
      credits: -450,
      route: ['proxima'],
    },
  },
  {
    id: '2',
    timestamp: '2024-01-15T10:31:15.456Z',
    level: 'ECONOMY',
    action: 'CARGO_BUY',
    executionTimeMs: 12,
    stateDiff: {
      cargo: { iron: 5 },
      credits: -600,
    },
  },
  {
    id: '3',
    timestamp: '2024-01-15T10:32:00.789Z',
    level: 'NAVIGATION',
    action: 'ROUTE_PLOT',
    executionTimeMs: 8,
    stateDiff: {
      route: ['sol', 'proxima', 'kepler'],
      distance: 124.2,
    },
  },
  {
    id: '4',
    timestamp: '2024-01-15T10:33:22.001Z',
    level: 'ENGINE',
    action: 'TIME_SKIP',
    executionTimeMs: 23,
    stateDiff: {
      timeAccelerated: 1,
      combo: 5,
    },
  },
];

interface SystemMenuAndDiagnosticsProps {
  mode?: 'settings-menu' | 'debug-console';
}

// ── Debug Console Overlay (shared component view) ───────────────────────
function DebugConsoleView({
  filter,
  setFilter,
}: {
  filter: 'ALL' | 'ENGINE' | 'ECONOMY' | 'NAVIGATION';
  setFilter: (f: 'ALL' | 'ENGINE' | 'ECONOMY' | 'NAVIGATION') => void;
}) {
  const filteredLogs = MOCK_LOGS.filter((log) => (filter === 'ALL' ? true : log.level === filter));

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90">
      {/* Header */}
      <div className="fixed left-0 right-0 top-0 z-[101] mx-auto flex max-w-[430px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Terminal className="h-5 w-5" /> Debug Console
        </h2>
        <div className="flex items-center gap-2">
          <button className="rounded p-1 text-secondary-foreground/60 hover:bg-secondary/30">
            <Filter className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-secondary-foreground/60 hover:bg-secondary/30">
            <Copy className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-secondary-foreground/60 hover:bg-secondary/30">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="fixed left-0 right-0 top-[50px] z-[100] mx-auto flex max-w-[430px] gap-1 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 pb-2">
        {(['ALL', 'ENGINE', 'ECONOMY', 'NAVIGATION'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium',
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/30 text-secondary-foreground hover:bg-secondary-hover/30'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Log viewer */}
      <div className="fixed left-0 right-0 top-[90px] mx-auto max-w-[430px] overflow-y-auto px-4 pb-20">
        <div className="space-y-1 pt-2 font-mono text-[11px]">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={cn(
                'space-y-1 rounded-lg border border-secondary bg-secondary/20 p-3',
                'transition-colors hover:border-primary/30'
              )}
            >
              <div className="flex items-center justify-between text-[10px] text-secondary-foreground/50">
                <span>{log.timestamp}</span>
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[9px] font-medium',
                    log.level === 'ENGINE' && 'bg-primary/30 text-secondary-foreground',
                    log.level === 'ECONOMY' && 'bg-warning/30 text-warning',
                    log.level === 'NAVIGATION' && 'bg-rarity-epic/30 text-rarity-epic'
                  )}
                >
                  {log.level}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{log.action}</span>
                <span className="text-secondary-foreground/60">{log.executionTimeMs}ms</span>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-black/30 p-2 text-[10px] text-secondary-foreground/60">
                {JSON.stringify(log.stateDiff, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div className="fixed bottom-0 left-0 right-0 z-[101] mx-auto flex max-w-[430px] gap-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-secondary/50 bg-secondary/30 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary-hover/30">
          <Download className="h-4 w-4" /> Export Trace
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-danger-border bg-danger-bg/30 py-2 text-sm font-medium text-danger hover:bg-danger-bg/30">
          <Trash2 className="h-4 w-4" /> Clear Logs
        </button>
      </div>
    </div>
  );
}

// ── System Menu / Diagnostics Drawer ────────────────────────────────────
const SystemMenuAndDiagnostics = ({ mode }: SystemMenuAndDiagnosticsProps) => {
  const [versionTaps, setVersionTaps] = useState(0);
  const [filter, setFilter] = useState<'ALL' | 'ENGINE' | 'ECONOMY' | 'NAVIGATION'>('ALL');
  const [debugActive, setDebugActive] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Local demo state representing the player's run (New Run starter state: Sol, 100 CR, 100 EN)
  const [runState, setRunState] = useState({
    systemName: 'Sol',
    credits: INITIAL_CREDITS,
    energy: INITIAL_ENERGY,
    cargoHold: [] as { symbol: string; quantity: number }[],
    discoveredElements: new Set<number>(),
  });

  // ── 5-tap trigger on version footer ──
  const handleVersionTap = useCallback(() => {
    const newTaps = versionTaps + 1;
    setVersionTaps(newTaps);
    if (newTaps >= 5) {
      setDebugActive(true);
      setVersionTaps(0);
    }
  }, [versionTaps]);

  useEffect(() => {
    const timer = setTimeout(() => setVersionTaps(0), 10000);
    return () => clearTimeout(timer);
  }, [versionTaps]);

  // ── Force UI Update (Clear Cache & Preserve Save) ──
  const handleForceUpdate = () => {
    // Demo-only: force re-render key change while preserving runState
    setRunState((prev) => ({ ...prev }));
  };

  // ── New Run / Reset ──
  const handleNewRun = () => setShowResetConfirm(true);

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    setRunState({
      systemName: 'Sol',
      credits: INITIAL_CREDITS,
      energy: INITIAL_ENERGY,
      cargoHold: [],
      discoveredElements: new Set(),
    });
  };

  // ── iOS Install Guide trigger ──
  const handleInstallGuide = () => setShowInstallGuide((p) => !p);

  const iOSGuide = (
    <div className="space-y-3 border-t pt-4">
      <h3 className="text-sm font-medium text-secondary-foreground">iOS Install Guide</h3>
      <p className="mb-2 text-xs text-secondary-foreground/60">
        Safari's 7-day ITP storage wipe prevention. If running in mobile Safari and not standalone:
      </p>
      <ol className="list-inside list-disc space-y-1 text-xs text-secondary-foreground/60">
        <li>Tap Share → scroll down → "Add to Home Screen"</li>
        <li>Confirm adding the app to your home screen</li>
        <li>Launch from Home Screen for standalone mode</li>
      </ol>
      <p className="mt-2 text-[10px] text-secondary-foreground/60">
        This prevents Safari's 7-day storage wipe and preserves your progress.
      </p>
    </div>
  );

  const resetConfirm = (
    <div className="space-y-3 rounded-xl border border-danger-border bg-danger-bg/30 p-4">
      <p className="mb-2 text-sm font-medium text-warning">New Run / Reset</p>
      <p className="text-[10px] text-secondary-foreground/60">
        Confirming will wipe Credits, Cargo Hold, and the full 118-element Discovery Codex. The run
        resets to Sol with 100 CR / 100 EN.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          onClick={handleConfirmReset}
          className="flex-1 rounded-lg bg-danger py-2 text-sm font-medium text-primary-foreground active:bg-danger"
        >
          <AlertTriangle className="mr-1 h-4 w-4" /> Confirm Reset
        </button>
        <button
          onClick={() => setShowResetConfirm(false)}
          className="flex-1 rounded-lg border border-secondary/50 bg-secondary/30 py-2 text-sm font-medium text-secondary-foreground active:bg-primary-active/30"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const runStatus = (
    <div className="space-y-1 rounded-lg border border-secondary bg-secondary/20 p-3">
      <p className="text-[10px] font-medium text-secondary-foreground">Run State</p>
      <div className="space-y-1 text-[10px] text-secondary-foreground">
        <div className="flex justify-between">
          <span className="text-muted-foreground">System</span>
          <span className="font-mono text-foreground">{runState.systemName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Credits</span>
          <span className="font-mono text-rarity-legendary">{formatCredits(runState.credits)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Energy</span>
          <span className="font-mono text-secondary-foreground">
            {runState.energy} / {INITIAL_ENERGY} EN
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Discovery Codex</span>
          <span className="font-mono text-secondary-foreground">
            {runState.discoveredElements.size} / {ELEMENTS.length}
          </span>
        </div>
      </div>
    </div>
  );

  if (mode === 'settings-menu') {
    return (
      <div className="relative">
        {/* Settings Menu */}
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[80vh] w-full max-w-md space-y-6 overflow-y-auto rounded-2xl bg-[hsl(var(--card))] p-6 shadow-2xl shadow-black/30">
            <h2 className="text-center text-xl font-bold text-foreground">Settings</h2>

            {/* iOS Install Guide */}
            <div className="space-y-3 border-t pt-4">
              <button
                onClick={handleInstallGuide}
                className="flex items-center justify-between py-2 text-sm font-medium text-secondary-foreground hover:text-foreground"
              >
                <span>iOS Install Guide</span>
                <Smartphone className="ml-2 h-4 w-4" />
              </button>
              {showInstallGuide && iOSGuide}
            </div>

            {/* Save Backup */}
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-sm font-medium text-secondary-foreground">Save Backup</h3>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-secondary/50 bg-secondary/30 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary-hover/30 active:bg-secondary-active">
                <Download className="h-4 w-4" /> Export Save (JSON)
              </button>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-secondary/50 bg-secondary/30 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary-hover/30 active:bg-secondary-active">
                <Upload className="h-4 w-4" /> Import Save
              </button>
            </div>

            {/* Diagnostics */}
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-sm font-medium text-secondary-foreground">Diagnostics</h3>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground active:bg-primary-active"
                onClick={handleForceUpdate}
              >
                <Wrench className="h-4 w-4" /> Force UI Update (Clear Cache & Preserve Save)
              </button>
            </div>

            {/* New Run / Reset */}
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-sm font-medium text-warning">New Run / Reset</h3>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-warning/50 bg-warning-bg/30 py-2 text-sm font-medium text-warning hover:bg-warning-bg/30 active:bg-warning-bg"
                onClick={handleNewRun}
              >
                <Rocket className="h-4 w-4" /> New Run / Reset
              </button>
              {showResetConfirm && resetConfirm}
            </div>

            {/* Run state */}
            {runStatus}

            {/* Version footer */}
            <div className="border-t pt-4 text-center">
              <button
                type="button"
                className="m-0 border-none bg-none p-0 text-left align-baseline text-xs font-normal text-secondary-foreground/60"
                onClick={handleVersionTap}
              >
                v0.1.0-alpha <span className="text-primary/50">(tap 5× for Debug)</span>
              </button>
              <p className="mt-1 text-[10px] text-secondary-foreground/40">
                Version taps: {versionTaps} / 5
              </p>
            </div>
          </div>
        </div>
        {debugActive && <DebugConsoleView filter={filter} setFilter={setFilter} />}
      </div>
    );
  }

  // ── Debug Console Overlay ──
  if (mode === 'debug-console') {
    return <DebugConsoleView filter={filter} setFilter={setFilter} />;
  }

  // Default: nothing rendered (just the settings UI wrapper)
  return null;
};

const meta: Meta<typeof SystemMenuAndDiagnostics> = {
  title: '05-System-And-Diagnostics/SystemMenuAndDiagnostics',
  component: SystemMenuAndDiagnostics,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'iphone14' },
  },
};

export default meta;
type Story = StoryObj<typeof SystemMenuAndDiagnostics>;

// ── Story exports ──
export const _SystemMenuDrawer: Story = {
  name: 'SystemMenuDrawer',
  args: {
    mode: 'settings-menu',
  },
  parameters: {
    docs: {
      description: {
        story:
          '**SystemMenuDrawer**: iOS Install Guide trigger, New Run / Reset (confirmation wipes Credits, Cargo Hold, and the 118-element Discovery Codex), Force UI Update (Clear Cache & Preserve Save), run state readout, and version footer (v0.1.0-alpha — tapping 5× opens DebugConsoleOverlay).',
      },
    },
  },
};

export const _DebugConsoleOverlay: Story = {
  name: 'DebugConsoleOverlay',
  args: {
    mode: 'debug-console',
  },
  parameters: {
    docs: {
      description: {
        story:
          '**DebugConsoleOverlay**: Filterable log viewer (ALL, ENGINE, ECONOMY, NAVIGATION) displaying mock state-diff entries (action, executionTimeMs, stateDiff JSON tree) and [EXPORT TRACE] / [CLEAR LOGS] actions. Accessible via 5-tap hidden trigger on version footer (v0.1.0-alpha).',
      },
    },
  },
};
