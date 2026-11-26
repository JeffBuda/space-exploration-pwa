import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, Menu, X } from "lucide-react";
import { ELEMENTS } from "@/lib/elements";

interface UnsafePlanetModalProps {
  onClose?: () => void;
  previousSpaceport?: string;
  lostCargo?: { symbol: string; quantity: number }[];
}

const UnsafePlanetModal = ({
  onClose,
  previousSpaceport = "Sol Spaceport",
  lostCargo = [
    { symbol: "Au", quantity: 15 },
    { symbol: "Fe", quantity: 20 },
  ],
}: UnsafePlanetModalProps) => {
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
            <h2 className="text-xl font-bold text-red-400">
              <AlertTriangle className="w-5 h-5 mr-2" /> Ship Destroyed
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
        <div className="mb-6 p-4 rounded-lg border border-red-600/30 bg-red-900/20">
          <p className="text-[10px] text-red-300 font-medium">Unsafe Planet Landing</p>
          <p className="text-cyan-100 font-medium text-sm">
            Your ship was destroyed upon landing on this planet.
          </p>
          <p className="text-[10px] text-red-300/60 mt-1">
            Cargo Hold contents have been completely wiped.
          </p>
        </div>

        {/* Lost Cargo */}
        <div className="mb-4 p-3 rounded-lg border border-red-600/30 bg-red-900/20">
          <p className="text-[10px] text-red-300 font-medium mb-2">Cargo Wiped</p>
          {lostCargo.map((item) => {
            const element = ELEMENTS.find((e) => e.symbol === item.symbol);
            return (
              <div key={item.symbol} className="flex justify-between text-[10px] text-cyan-200">
                <span>{element?.name || item.symbol} ({item.symbol})</span>
                <span className="font-mono text-red-400">{item.quantity}</span>
              </div>
            );
          })}
          <p className="mt-2 text-[10px] text-red-300/60">
            All Cargo Hold contents have been lost.
          </p>
        </div>

        {/* Tow Recovery */}
        <div className="mb-4 p-3 rounded-lg border border-cyan-700/30 bg-cyan-900/20">
          <p className="text-[10px] text-cyan-300 font-medium mb-1">Recovery Tow</p>
          <p className="text-[10px] text-cyan-200/60">
            Your ship is being towed back to the previous Spaceport.
          </p>
          <p className="text-[10px] text-cyan-300 font-medium mt-2">Previous Spaceport: {previousSpaceport}</p>
          <p className="text-[10px] text-cyan-200/60">Your ship will be repaired upon arrival.</p>
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
            <RotateCcw className="w-4 h-4 mr-1" /> Return to Spaceport
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

const meta: Meta<typeof UnsafePlanetModal> = {
  title: "04-Hazards-And-Endgame/UnsafePlanetModal",
  component: UnsafePlanetModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "iphone14" },
  },
};

export default meta;
type Story = StoryObj<typeof UnsafePlanetModal>;

export const CargoWipeAndSpaceportTow: Story = {
  args: {
    onClose: () => console.log("Closed"),
    previousSpaceport: "Sol Spaceport",
    lostCargo: [
      { symbol: "Au", quantity: 15 },
      { symbol: "Fe", quantity: 20 },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Triggered when landing on an Unsafe planet, showing ship destruction, full Cargo Hold wipe, and recovery tow back to the previous Spaceport. Soft-failure recovery: ship is repaired, cargo is lost, and player returns to previous Spaceport.",
      },
    },
  },
};