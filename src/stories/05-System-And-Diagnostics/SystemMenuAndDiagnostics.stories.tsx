import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Terminal, Wrench, Download, Upload, Trash2, Filter, Copy } from "lucide-react";
import { useRef, useEffect } from "react";
import {
  formatCredits,
  formatDuration,
  formatTimeDHMS,
  formatTimeHMS,
  INITIAL_PRESTIGE,
  INITIAL_CODEX,
  markElementDiscovered,
  calculateTimeSkipAmount,
  processTimeSkipTap,
} from "@/lib/game";
import { ELEMENTS } from "@/lib/elements";

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
    id: "1",
    timestamp: "2024-01-15T10:30:00.123Z",
    level: "ENGINE",
    action: "WARP_INITIATE",
    executionTimeMs: 45,
    stateDiff: {
      location: "Sol → Proxima",
      credits: -450,
      route: ["proxima"],
    },
  },
  {
    id: "2",
    timestamp: "2024-01-15T10:31:15.456Z",
    level: "ECONOMY",
    action: "CARGO_BUY",
    executionTimeMs: 12,
    stateDiff: {
      cargo: { iron: 5 },
      credits: -600,
    },
  },
  {
    id: "3",
    timestamp: "2024-01-15T10:32:00.789Z",
    level: "NAVIGATION",
    action: "ROUTE_PLOT",
    executionTimeMs: 8,
    stateDiff: {
      route: ["sol", "proxima", "kepler"],
      distance: 124.2,
    },
  },
  {
    id: "4",
    timestamp: "2024-01-15T10:33:22.001Z",
    level: "ENGINE",
    action: "TIME_SKIP",
    executionTimeMs: 23,
    stateDiff: {
      timeAccelerated: 1,
      combo: 5,
    },
  },
];

interface SystemMenuAndDiagnosticsProps {
  mode?: "settings-menu" | "debug-console";
}

const SystemMenuAndDiagnostics = ({
  mode,
}: SystemMenuAndDiagnosticsProps) => {
  const [versionTaps, setVersionTaps] = useState(0);
  const [filter, setFilter] = useState<"ALL" | "ENGINE" | "ECONOMY" | "NAVIGATION">("ALL");
  const [debugActive, setDebugActive] = useState(false);

  // ── 5-tap trigger on version footer ──
  const handleVersionTap = () => {
    const newTaps = versionTaps + 1;
    setVersionTaps(newTaps);
    if (newTaps >= 5 && !debugActive) {
      setDebugActive(true);
      setVersionTaps(0);
    } else if (newTaps >= 5 && debugActive) {
      setVersionTaps(0);
      setDebugActive(false);
    }
  };

  const filteredLogs = MOCK_LOGS.filter((log) =>
    filter === "ALL" ? true : log.level === filter
  );

  useEffect(() => {
    const timer = setTimeout(() => setVersionTaps(0), 10000);
    return () => clearTimeout(timer);
  }, [versionTaps]);

  // ── Settings Menu view ──
  if (mode === "settings-menu") {
    return (
      <div className="relative">
        {/* Settings Menu */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[hsl(var(--card))] rounded-2xl p-6 shadow-2xl shadow-black/30 space-y-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-cyan-100 text-center">Settings</h2>

            {/* iOS Install Guide */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-sm font-medium text-cyan-300">iOS Install Guide</h3>
              <p className="text-xs text-cyan-200/60 mb-2">
                Safari's 7-day ITP storage wipe prevention. If running in mobile Safari and not standalone:
              </p>
              <ol className="list-disc list-inside text-xs text-cyan-200/60 space-y-1">
                <li>
                  Tap Share → scroll down → "Add to Home Screen"
                </li>
                <li>
                  Confirm adding the app to your home screen
                </li>
                <li>
                  Launch from Home Screen for standalone mode
                </li>
              </ol>
              <p className="text-[10px] text-cyan-200/60 mt-2">
                This prevents Safari's 7-day storage wipe and preserves your progress.
              </p>
            </div>

            {/* Save Backup */}
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-sm font-medium text-cyan-300">Save Backup</h3>
              <button className="w-full py-2 rounded-lg text-sm font-medium bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Export Save (JSON)
              </button>
              <button className="w-full py-2 rounded-lg text-sm font-medium bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900 flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" /> Import Save
              </button>
            </div>

            {/* Force UI Update */}
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-sm font-medium text-cyan-300">Diagnostics</h3>
              <button className="w-full py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white flex items-center justify-center gap-2">
                <Wrench className="w-4 h-4" /> Force UI Update (Clear Cache & Preserve Save)
              </button>
            </div>

            {/* Version footer */}
            <div className="border-t pt-4 text-center">
              <p
                className="text-xs text-cyan-300/60 cursor-pointer"
                onClick={handleVersionTap}
              >
                v0.1.0-alpha <span className="text-cyan-400/50">(tap 5× for Debug)</span>
              </p>
              <p className="text-[10px] text-cyan-300/40 mt-1">
                Version taps: {versionTaps} / 5
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Debug Console Overlay ──
  if (mode === "debug-console") {
    return (
      <div className="relative">
        {/* Debug Console Overlay */}
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
          {/* Header */}
          <div className="fixed top-0 left-0 right-0 mx-auto max-w-[430px] px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-center justify-between z-[101]">
            <h2 className="text-lg font-bold text-cyan-100 flex items-center gap-2">
              <Terminal className="w-5 h-5" /> Debug Console
            </h2>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded hover:bg-cyan-900/30 text-cyan-300/60">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-1 rounded hover:bg-cyan-900/30 text-cyan-300/60">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-1 rounded hover:bg-cyan-900/30 text-cyan-300/60">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="fixed top-[50px] left-0 right-0 mx-auto max-w-[430px] px-4 flex gap-1 border-b border-[hsl(var(--border))] pb-2 bg-[hsl(var(--card))] z-[100]">
            {(["ALL", "ENGINE", "ECONOMY", "NAVIGATION"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium",
                  filter === f
                    ? "bg-cyan-600 text-white"
                    : "bg-cyan-900/30 text-cyan-300 hover:bg-cyan-800/30",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Log viewer */}
          <div className="fixed top-[90px] left-0 right-0 mx-auto max-w-[430px] px-4 pb-20 overflow-y-auto">
            <div className="space-y-1 pt-2 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "p-3 rounded-lg bg-cyan-900/20 border border-cyan-700/30 space-y-1",
                    "hover:border-cyan-500/30 transition-colors"
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] text-cyan-300/50">
                    <span>{log.timestamp}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-medium",
                      log.level === "ENGINE" && "bg-cyan-600/30 text-cyan-300",
                      log.level === "ECONOMY" && "bg-amber-600/30 text-amber-300",
                      log.level === "NAVIGATION" && "bg-purple-600/30 text-purple-300",
                    )}>
                      {log.level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-cyan-100">{log.action}</span>
                    <span className="text-cyan-300/60">{log.executionTimeMs}ms</span>
                  </div>
                  <pre className="text-cyan-200/60 whitespace-pre-wrap overflow-x-auto text-[10px] bg-black/30 p-2 rounded">
                    {JSON.stringify(log.stateDiff, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[430px] px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] flex gap-2 z-[101]">
            <button className="flex-1 py-2 rounded-lg text-sm font-medium bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/30 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Export Trace
            </button>
            <button className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-900/30 border border-red-700/50 text-red-400 hover:bg-red-800/30 flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" /> Clear Logs
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: nothing rendered (just the settings UI wrapper)
  return null;
};

const meta: Meta<typeof SystemMenuAndDiagnostics> = {
  title: "05-System-And-Diagnostics/SystemMenuAndDiagnostics",
  component: SystemMenuAndDiagnostics,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "iphone14" },
  },
};

export default meta;
type Story = StoryObj<typeof SystemMenuAndDiagnostics>;

export const SettingsMenu: Story = {
  args: {
    mode: "settings-menu",
  },
  parameters: {
    docs: {
      description: {
        story:
          "**SettingsMenu**: Audio/haptics toggles, iOS Install Guide, Save Backup (JSON export/import UI), Force UI Update (Clear Cache & Preserve Save) button, and version footer (v0.1.0-alpha — tapping 5× opens the Debug Console).",
      },
    },
  },
};

export const DebugConsoleOverlay: Story = {
  args: {
    mode: "debug-console",
  },
  parameters: {
    docs: {
      description: {
        story:
          "**DebugConsoleOverlay**: Filterable log viewer (ALL, ENGINE, ECONOMY, NAVIGATION) displaying mock state-diff entries (action, executionTimeMs, stateDiff JSON tree) and [EXPORT TRACE] / [CLEAR LOGS] actions. Accessible via 5-tap hidden trigger on version footer (v0.1.0-alpha).",
      },
    },
  },
};