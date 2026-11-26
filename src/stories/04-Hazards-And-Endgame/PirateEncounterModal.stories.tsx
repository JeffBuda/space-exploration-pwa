import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Trophy, Menu, X, Zap } from "lucide-react";

function formatHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

interface PirateEncounterModalProps {
  onClose?: () => void;
  stolenCargo?: { symbol: string; name: string; quantity: number };
  remainingCargo?: number;
}

const PirateEncounterModal = ({
  onClose,
  stolenCargo = { symbol: "Au", name: "Gold", quantity: 15 },
  remainingCargo = 20,
}: PirateEncounterModalProps) => {
  const [open, setOpen] = useState(true);
  const [evasionAttempts, setEvasionAttempts] = useState(0);
  const [evasionSuccess, setEvasionSuccess] = useState(false);

  if (!open) return null;

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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-amber-400">
              <AlertTriangle className="w-5 h-5 mr-2" /> Pirate Interception
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg hover:bg-cyan-900/30 text-cyan-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report */}
        <div className="mb-6 p-4 rounded-lg border border-amber-600/30 bg-amber-900/20">
          <p className="text-[10px] text-amber-300 font-medium">Mid-Hop Interception</p>
          <p className="text-cyan-100 font-medium text-sm">
            Your route was intercepted by pirates {formatHMS(45)} into your hop.
          </p>
          <p className="text-[10px] text-amber-300/60 mt-1">
            A random amount of cargo was stolen from your hold.
          </p>
        </div>

        {/* Stolen details */}
        <div className="mb-4 p-3 rounded-lg border border-amber-600/30 bg-amber-900/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-300 font-medium text-sm">{stolenCargo.name}</span>
            <span className="text-[10px] text-amber-300/60">{stolenCargo.symbol}</span>
          </div>
          <p className="text-[10px] text-amber-300">
            Quantity stolen: <span className="font-mono text-amber-400">{stolenCargo.quantity}</span>
          </p>
          <p className="text-[10px] text-amber-300/60">
            Remaining cargo: <span className="font-mono text-amber-400">{remainingCargo}</span>
          </p>
        </div>

        {/* Evasion clicker */}
        <div className="mb-4 p-3 rounded-lg border border-cyan-700/30 bg-cyan-900/20">
          <p className="text-[10px] text-cyan-300 font-medium mb-2">Cadence-Scaling Evasion</p>
          <p className="text-[10px] text-cyan-200/60 mb-2">
            Tapping faster increases evasion probability. Failing to evade loses a random amount of Periodic Table cargo.
          </p>
          <div className="flex items-center justify-between gap-2">
            <button
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-gradient-to-br from-cyan-600 to-cyan-800 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-transform"
              onClick={() => {
                setEvasionAttempts((prev) => prev + 1);
                if (evasionAttempts >= 5) {
                  setEvasionSuccess(true);
                }
              }}
            >
              <Zap className="w-4 h-4 mr-1" />
              Evade (Attempt {evasionAttempts + 1})
            </button>
            <span className="text-xs font-mono text-cyan-300">
              {Math.min(evasionAttempts * 10, 100)}% chance
            </span>
          </div>
          {evasionSuccess && (
            <div className="mt-2 p-2 rounded bg-green-900/30 border border-green-600/30">
              <p className="text-[10px] text-green-300">Evaded with 0 loss!</p>
            </div>
          )}
        </div>

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
            <Trophy className="w-4 h-4 mr-1" /> Continue Mission
          </button>
          <button
            onClick={() => setOpen(false)}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium",
              "bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
            )}
          >
            <Menu className="w-4 h-4 mr-1" /> Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof PirateEncounterModal> = {
  title: "04-Hazards-And-Endgame/PirateEncounterModal",
  component: PirateEncounterModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "iphone14" },
  },
};

export default meta;
type Story = StoryObj<typeof PirateEncounterModal>;

export const InteractiveClickerEvasion: Story = {
  args: {
    onClose: () => console.log("Closed"),
    stolenCargo: { symbol: "Au", name: "Gold", quantity: 15 },
    remainingCargo: 20,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Mid-hop pirate ambush featuring the cadence-scaling clicker button, live evasion probability gauge, and interactive outcomes (Evaded with 0 loss vs. Failed with random cargo stolen).",
      },
    },
  },
};

export const PirateIronStolen: Story = {
  args: {
    onClose: () => console.log("Closed"),
    stolenCargo: { symbol: "Fe", name: "Iron", quantity: 40 },
    remainingCargo: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          "**PirateEncounterModal** with Iron stolen — demonstrates that any Periodic Table element can be targeted. Evasion uses cadence-scaling clicker mechanic.",
      },
    },
  },
};