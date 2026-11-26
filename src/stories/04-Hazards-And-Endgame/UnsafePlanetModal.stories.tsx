import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, RotateCcw, Menu, X } from 'lucide-react';
import { ELEMENTS } from '@/lib/elements';

interface UnsafePlanetModalProps {
  onClose?: () => void;
  previousSpaceport?: string;
  lostCargo?: { symbol: string; quantity: number }[];
}

const UnsafePlanetModal = ({
  onClose,
  previousSpaceport = 'Sol Spaceport',
  lostCargo = [
    { symbol: 'Au', quantity: 15 },
    { symbol: 'Fe', quantity: 20 },
  ],
}: UnsafePlanetModalProps) => {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className={cn(
          'w-full max-w-md space-y-2 rounded-2xl bg-[hsl(var(--card))] p-6 shadow-2xl shadow-black/30',
          'animate-slide-in-from-bottom'
        )}
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-red-400">
              <AlertTriangle className="mr-2 h-5 w-5" /> Ship Destroyed
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-cyan-200/60 transition-colors hover:bg-cyan-900/30"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Report */}
        <div className="mb-6 rounded-lg border border-red-600/30 bg-red-900/20 p-4">
          <p className="text-[10px] font-medium text-red-300">Unsafe Planet Landing</p>
          <p className="text-sm font-medium text-cyan-100">
            Your ship was destroyed upon landing on this planet.
          </p>
          <p className="mt-1 text-[10px] text-red-300/60">
            Cargo Hold contents have been completely wiped.
          </p>
        </div>

        {/* Lost Cargo */}
        <div className="mb-4 rounded-lg border border-red-600/30 bg-red-900/20 p-3">
          <p className="mb-2 text-[10px] font-medium text-red-300">Cargo Wiped</p>
          {lostCargo.map((item) => {
            const element = ELEMENTS.find((e) => e.symbol === item.symbol);
            return (
              <div key={item.symbol} className="flex justify-between text-[10px] text-cyan-200">
                <span>
                  {element?.name || item.symbol} ({item.symbol})
                </span>
                <span className="font-mono text-red-400">{item.quantity}</span>
              </div>
            );
          })}
          <p className="mt-2 text-[10px] text-red-300/60">
            All Cargo Hold contents have been lost.
          </p>
        </div>

        {/* Tow Recovery */}
        <div className="mb-4 rounded-lg border border-cyan-700/30 bg-cyan-900/20 p-3">
          <p className="mb-1 text-[10px] font-medium text-cyan-300">Recovery Tow</p>
          <p className="text-[10px] text-cyan-200/60">
            Your ship is being towed back to the previous Spaceport.
          </p>
          <p className="mt-2 text-[10px] font-medium text-cyan-300">
            Previous Spaceport: {previousSpaceport}
          </p>
          <p className="text-[10px] text-cyan-200/60">Your ship will be repaired upon arrival.</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-2 border-t border-[hsl(var(--border))] pt-4">
          <button
            onClick={() => setOpen(false)}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-medium',
              'bg-cyan-600 text-white hover:bg-cyan-700',
              'active:bg-cyan-800'
            )}
          >
            <RotateCcw className="mr-1 h-4 w-4" /> Return to Spaceport
          </button>
          <button
            onClick={() => setOpen(false)}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-medium',
              'border border-cyan-700/50 bg-cyan-900/30 text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900'
            )}
          >
            <Menu className="mr-1 h-4 w-4" /> Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof UnsafePlanetModal> = {
  title: '04-Hazards-And-Endgame/UnsafePlanetModal',
  component: UnsafePlanetModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'iphone14' },
  },
};

export default meta;
type Story = StoryObj<typeof UnsafePlanetModal>;

export const CargoWipeAndSpaceportTow: Story = {
  args: {
    onClose: () => console.log('Closed'),
    previousSpaceport: 'Sol Spaceport',
    lostCargo: [
      { symbol: 'Au', quantity: 15 },
      { symbol: 'Fe', quantity: 20 },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Triggered when landing on an Unsafe planet, showing ship destruction, full Cargo Hold wipe, and recovery tow back to the previous Spaceport. Soft-failure recovery: ship is repaired, cargo is lost, and player returns to previous Spaceport.',
      },
    },
  },
};
