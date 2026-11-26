import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Trophy, Menu, X, Zap } from 'lucide-react';

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
  stolenCargo = { symbol: 'Au', name: 'Gold', quantity: 15 },
  remainingCargo = 20,
}: PirateEncounterModalProps) => {
  const [open, setOpen] = useState(true);
  const [evasionAttempts, setEvasionAttempts] = useState(0);
  const [evasionSuccess, setEvasionSuccess] = useState(false);

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
            <h2 className="text-xl font-bold text-amber-400">
              <AlertTriangle className="mr-2 h-5 w-5" /> Pirate Interception
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
        <div className="mb-6 rounded-lg border border-amber-600/30 bg-amber-900/20 p-4">
          <p className="text-[10px] font-medium text-amber-300">Mid-Hop Interception</p>
          <p className="text-sm font-medium text-cyan-100">
            Your route was intercepted by pirates {formatHMS(45)} into your hop.
          </p>
          <p className="mt-1 text-[10px] text-amber-300/60">
            A random amount of cargo was stolen from your hold.
          </p>
        </div>

        {/* Stolen details */}
        <div className="mb-4 rounded-lg border border-amber-600/30 bg-amber-900/20 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-amber-300">{stolenCargo.name}</span>
            <span className="text-[10px] text-amber-300/60">{stolenCargo.symbol}</span>
          </div>
          <p className="text-[10px] text-amber-300">
            Quantity stolen:{' '}
            <span className="font-mono text-amber-400">{stolenCargo.quantity}</span>
          </p>
          <p className="text-[10px] text-amber-300/60">
            Remaining cargo: <span className="font-mono text-amber-400">{remainingCargo}</span>
          </p>
        </div>

        {/* Evasion clicker */}
        <div className="mb-4 rounded-lg border border-cyan-700/30 bg-cyan-900/20 p-3">
          <p className="mb-2 text-[10px] font-medium text-cyan-300">Cadence-Scaling Evasion</p>
          <p className="mb-2 text-[10px] text-cyan-200/60">
            Tapping faster increases evasion probability. Failing to evade loses a random amount of
            Periodic Table cargo.
          </p>
          <div className="flex items-center justify-between gap-2">
            <button
              className="flex-1 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-800 py-2 text-sm font-medium text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform active:scale-95"
              onClick={() => {
                setEvasionAttempts((prev) => prev + 1);
                if (evasionAttempts >= 5) {
                  setEvasionSuccess(true);
                }
              }}
            >
              <Zap className="mr-1 h-4 w-4" />
              Evade (Attempt {evasionAttempts + 1})
            </button>
            <span className="font-mono text-xs text-cyan-300">
              {Math.min(evasionAttempts * 10, 100)}% chance
            </span>
          </div>
          {evasionSuccess && (
            <div className="mt-2 rounded border border-green-600/30 bg-green-900/30 p-2">
              <p className="text-[10px] text-green-300">Evaded with 0 loss!</p>
            </div>
          )}
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
            <Trophy className="mr-1 h-4 w-4" /> Continue Mission
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

const meta: Meta<typeof PirateEncounterModal> = {
  title: '04-Hazards-And-Endgame/PirateEncounterModal',
  component: PirateEncounterModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'iphone14' },
  },
};

export default meta;
type Story = StoryObj<typeof PirateEncounterModal>;

export const InteractiveClickerEvasion: Story = {
  args: {
    onClose: () => console.log('Closed'),
    stolenCargo: { symbol: 'Au', name: 'Gold', quantity: 15 },
    remainingCargo: 20,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Mid-hop pirate ambush featuring the cadence-scaling clicker button, live evasion probability gauge, and interactive outcomes (Evaded with 0 loss vs. Failed with random cargo stolen).',
      },
    },
  },
};

export const PirateIronStolen: Story = {
  args: {
    onClose: () => console.log('Closed'),
    stolenCargo: { symbol: 'Fe', name: 'Iron', quantity: 40 },
    remainingCargo: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          '**PirateEncounterModal** with Iron stolen — demonstrates that any Periodic Table element can be targeted. Evasion uses cadence-scaling clicker mechanic.',
      },
    },
  },
};
