import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Target, Trophy, Menu, X } from "lucide-react";

interface VictoryCodexModalProps {
  onClose?: () => void;
}

const VictoryCodexModal = ({
  onClose,
}: VictoryCodexModalProps) => {
  const [open, setOpen] = useState(true);

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
            <h2 className="text-xl font-bold text-green-400">
              <Target className="w-5 h-5 mr-2" /> Codex Complete
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

        {/* Victory message */}
        <div className="mb-8 text-center">
          <p className="text-3xl font-bold text-green-400">All 118 Elements Discovered!</p>
          <p className="text-[10px] text-cyan-300/60 mt-2">Periodic Discovery Codex Complete</p>
          <p className="text-[10px] text-green-300/60 mb-4">Endless Play Mode Unlocked</p>
        </div>

        {/* Codex progress */}
        <div className="mb-6 p-3 rounded-lg border border-green-600/30 bg-green-900/20">
          <p className="text-[10px] text-green-300 font-medium">Discovery Progress</p>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-cyan-300">
            <div>
              <p>Discovered</p>
              <p className="font-mono text-green-300">118 / 118</p>
            </div>
            <div>
              <p>Remaining</p>
              <p className="font-mono text-green-300/60">0 / 118</p>
            </div>
          </div>
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
            <Trophy className="w-4 h-4 mr-1" /> Continue Endless Play
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

const meta: Meta<typeof VictoryCodexModal> = {
  title: "04-Hazards-And-Endgame/VictoryCodexModal",
  component: VictoryCodexModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "iphone14" },
  },
};

export default meta;
type Story = StoryObj<typeof VictoryCodexModal>;

export const All118ElementsComplete: Story = {
  args: {
    onClose: () => console.log("Closed"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Triggered when the 118th Periodic Table element is logged in the Codex, celebrating the Win State and unlocking Endless Play Mode. All 118 Periodic Table elements discovered.",
      },
    },
  },
};