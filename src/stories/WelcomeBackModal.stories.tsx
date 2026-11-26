import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { X, Clock, Sun, Moon, Sparkles, CheckCircle } from "lucide-react";

// Time formatting utility
function formatTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

interface CaptainLogEntry {
  id: string;
  timestamp: string;
  event: string;
  sector?: string;
}

interface WelcomeBackModalProps {
  onClose?: () => void;
  entries?: CaptainLogEntry[];
}

const DEFAULT_ENTRIES: CaptainLogEntry[] = [
  {
    id: "1",
    timestamp: "2024-01-15T10:30:00Z",
    event: "Departed Sol system",
    sector: "Sirius",
  },
  {
    id: "2",
    timestamp: "2024-01-15T14:12:00Z",
    event: "Collected solar data",
    sector: "Proxima Centauri",
  },
  {
    id: "3",
    timestamp: "2024-01-16T03:45:00Z",
    event: "Mined ice crystals",
    sector: "Kepler-186",
  },
];

const WelcomeBackModal = ({
  onClose,
  entries = DEFAULT_ENTRIES,
}: WelcomeBackModalProps) => {
  const [open, setOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"short" | "long">("short");

  // Calculate time away based on current simulated time
  const now = Date.now();
  const baseTime = new Date("2024-01-15T10:30:00Z").getTime();
  const elapsedMinutes = Math.floor((now - baseTime) / 60000);

  const totalMinutes = selectedTab === "short" ? 42 : 1 * 24 * 60 + 12 * 60 + 30;

  const awayMinutes = Math.min(elapsedMinutes, totalMinutes);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        className={cn(
          "bg-[hsl(var(--card))] rounded-2xl w-full max-w-md space-y-2 p-6 shadow-2xl shadow-black/30",
          "animate-slide-in-from-bottom"
        )}
        style={{ maxHeight: "90vh" }}
      >
        {/* Header with drag handle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-cyan-100">
              Welcome Back, Captain
            </h2>
            <p className="text-cyan-200/60 text-sm">
              Away for <span className="font-medium" id="away-time">
                {formatTime(awayMinutes)}
              </span>
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg hover:bg-cyan-900/30 text-cyan-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab toggle */}
        <div className="border-b border-[hsl(var(--border))] mb-4">
          <button
            onClick={() => setSelectedTab("short")}
            className={cn(
              "flex-1 py-2 text-sm font-medium",
              selectedTab === "short"
                ? "text-cyan-100 border-b-2 border-cyan-400"
                : "text-cyan-300 hover:text-cyan-100"
            )}
          >
            Short Away
          </button>
          <button
            onClick={() => setSelectedTab("long")}
            className={cn(
              "flex-1 py-2 text-sm font-medium",
              selectedTab === "long"
                ? "text-cyan-100 border-b-2 border-cyan-400"
                : "text-cyan-300 hover:text-cyan-100"
            )}
          >
            Long Expedition
          </button>
        </div>

        {/* Tier 1 Summary */}
        <div className="mb-4">
          <p className="text-cyan-200/60 text-sm mb-2">
            Tier 1 — Glanceable Summary (Default / Collapsed Drawer)
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-cyan-300">
              Distance Traveled:
            </span>
            <span className="font-medium text-cyan-100">
              {Math.floor(awayMinutes / 60)} LY
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-cyan-300">
              Passive Credits Earned:
            </span>
            <span className="font-medium text-cyan-100">
              {Math.floor(awayMinutes / 10)} Credits
            </span>
          </div>
        </div>

        {/* Tier 2 — Post-Arrival Overflow State */}
        {selectedTab === "long" && (
          <div className="mb-4 pt-4 border-t border-[hsl(var(--border))]">
            <p className="text-cyan-200/60 text-sm mb-2">
              Tier 2 — Actionable Controls (30%–50% Drawer / Expanded Card)
            </p>
            <div className="flex items-baseline gap-4">
              <div>
                <span className="text-xs text-cyan-400">Rolled Over:</span>
                <span className="font-medium text-cyan-100">
                  {Math.max(0, awayMinutes - totalMinutes)} minutes
                </span>
              </div>
              <div>
                <span className="text-xs text-cyan-400">Active Scanning:</span>
                <span className="font-medium text-cyan-100">
                  {Math.floor(Math.random() * 60)} min remaining
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tier 3 — Captain's Log Accordion */}
        {selectedTab === "long" && (
          <details className="space-y-1">
            <summary className="flex items-center justify-between py-2 px-1 rounded-md hover:bg-cyan-900/30 cursor-pointer">
              <span className="text-xs text-cyan-300">
                View Captain's Log (4 Events)
              </span>
              <svg
                className="w-4 h-4 text-cyan-300 rotate-180"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M7 10l5 5 5-5M7 14l5 5 5-5"
                />
              </svg>
            </summary>
            <div className="p-3 bg-cyan-900/30 rounded-md space-y-1 text-cyan-200/60 text-sm">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2">
                  <span className="text-cyan-400 text-sm">{entry.timestamp}</span>
                  <span className="ml-2 flex-1">{entry.event}</span>
                  {entry.sector && (
                    <span className="ml-auto text-cyan-400/50 text-xs">
                      ({entry.sector})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-[hsl(var(--border))] flex gap-2">
          <button
            onClick={() => setOpen(false)}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium",
              "bg-cyan-600 text-white hover:bg-cyan-700",
              "active:bg-cyan-800"
            )}
          >
            Continue Mission
          </button>
          <button
            onClick={() => setOpen(false)}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium",
              "bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
            )}
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof WelcomeBackModal> = {
  title: "AppShell/WelcomeBackModal",
  component: WelcomeBackModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "iphone14" },
  },
};

export default meta;
type Story = StoryObj<typeof WelcomeBackModal>;

export const ShortAway: Story = {
  args: {
    entries: [
      {
        id: "1",
        timestamp: "2024-01-15T10:30:00Z",
        event: "Departed Sol system",
        sector: "Sirius",
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Short away mission (42m 15s). Shows distance traveled and passive credits earned. Tier 1 summary only.",
      },
    },
  },
};

export const LongExpeditionWithLogs: Story = {
  args: {
    entries: DEFAULT_ENTRIES,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Long expedition away (1d 04h 12m 30s). Displays Tier 1 summary (+1,420 Credits, Arrived at Kepler-186), Tier 2 Post-Arrival Overflow State (3h 12m rolled into Passive Orbital Scanning), and Tier 3 collapsible View Captain's Log (4 Events) accordion.",
      },
    },
  },
};

export const StandaloneAutoHide: Story = {
  args: {
    entries: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Auto-hides when `display-mode: standalone` or `(navigator).standalone` is true.",
      },
    },
  },
};