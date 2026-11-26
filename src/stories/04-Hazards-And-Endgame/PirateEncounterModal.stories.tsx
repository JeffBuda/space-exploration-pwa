import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Trophy, Menu, X, Zap } from 'lucide-react';

function formatHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

interface PirateEncounterModalProps {
  onClose?: () => void;
  cargoHold?: { symbol: string; name?: string; quantity: number }[];
}

interface StolenCargo {
  symbol: string;
  name: string;
  quantity: number;
}

const PirateEncounterModal = ({
  onClose,
  cargoHold = [
    { symbol: 'Au', name: 'Gold', quantity: 15 },
    { symbol: 'Fe', name: 'Iron', quantity: 40 },
  ],
}: PirateEncounterModalProps) => {
  const [open, setOpen] = useState(true);
  const [comboTier, setComboTier] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const [secondsPerTap, setSecondsPerTap] = useState(1);
  const [phase, setPhase] = useState<'ready' | 'evaded' | 'failed'>('ready');
  const [stolen, setStolen] = useState<StolenCargo | null>(null);
  const decayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (decayTimer.current !== null) clearTimeout(decayTimer.current);
    },
    []
  );

  const handleTap = (now: number) => {
    if (decayTimer.current !== null) clearTimeout(decayTimer.current);
    let newCombo: number;
    if (now - lastTap > 1000) {
      newCombo = 0;
    } else {
      newCombo = Math.min(comboTier + 1, 20);
    }
    setComboTier(newCombo);
    setLastTap(now);
    const skip = newCombo <= 0 ? 1 : Math.floor(Math.pow(1.35, newCombo));
    setSecondsPerTap(skip);
    decayTimer.current = setTimeout(() => {
      setComboTier(0);
      setSecondsPerTap(1);
      decayTimer.current = null;
    }, 1000);
    return skip;
  };

  const gauge = Math.min(100, comboTier * 5); // rises as the player taps faster

  const handleAttemptEvade = () => {
    const skip = handleTap(Date.now());
    const success = Math.random() * 100 < gauge;
    if (success) {
      setPhase('evaded');
      setStolen(null);
    } else {
      // Failed: random Periodic Table cargo stolen from the hold
      const targets = cargoHold.length > 0 ? cargoHold : [{ symbol: 'Au', quantity: 15 }];
      const pick = targets[Math.floor(Math.random() * targets.length)];
      const element = pick.symbol ?? 'Unknown';
      const name = pick.name ?? element;
      setStolen({
        symbol: element,
        name,
        quantity: Math.max(1, Math.floor(Math.random() * pick.quantity)),
      });
      setPhase('failed');
    }
  };

  const handleContinue = () => {
    setOpen(false);
    setPhase('ready');
    setComboTier(0);
    setSecondsPerTap(1);
    setStolen(null);
  };

  if (!open) return null;

  const evasionGainedThisTap = gauge;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md space-y-2 rounded-2xl bg-[hsl(var(--card))] p-6 shadow-2xl shadow-black/30"
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
            onClick={handleContinue}
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
        {phase === 'failed' && stolen && (
          <div className="mb-4 rounded-lg border border-amber-600/30 bg-amber-900/20 p-3">
            <p className="mb-2 text-[10px] font-medium text-amber-300">Cargo Stolen</p>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-amber-300">{stolen.name}</span>
              <span className="text-[10px] text-amber-300/60">{stolen.symbol}</span>
            </div>
            <p className="text-[10px] text-amber-300">
              Quantity stolen: <span className="font-mono text-amber-400">{stolen.quantity}</span>
            </p>
          </div>
        )}

        {phase === 'evaded' && (
          <div className="mb-4 rounded-lg border border-green-600/30 bg-green-900/30 p-3">
            <p className="text-[10px] text-green-300">Evaded with 0 loss!</p>
          </div>
        )}

        {/* Evasion cadence-scaling clicker mini-game */}
        {phase === 'ready' && (
          <div className="mb-4 rounded-lg border border-cyan-700/30 bg-cyan-900/20 p-3">
            <p className="mb-2 text-[10px] font-medium text-cyan-300">Cadence-Scaling Evasion</p>
            <p className="mb-2 text-[10px] text-cyan-200/60">
              Tapping faster increases evasion probability. Failing to evade loses a random amount
              of Periodic Table cargo.
            </p>

            {/* Live evasion probability gauge */}
            <div className="mb-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] text-cyan-200/60">Evasion Probability</span>
                <span className="font-mono text-xs text-cyan-300">
                  {evasionGainedThisTap.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-green-400 transition-all duration-200"
                  style={{ width: `${Math.max(0, Math.min(100, evasionGainedThisTap))}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                className="flex-1 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-800 py-2 text-sm font-medium text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform active:scale-95"
                onClick={handleAttemptEvade}
              >
                <Zap className="mr-1 h-4 w-4" />
                Tap to Build Speed
              </button>
              <button
                className="flex-1 rounded-lg border border-cyan-700/50 bg-cyan-900/30 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
                onClick={handleAttemptEvade}
              >
                Attempt Evasion
              </button>
            </div>
            <p className="mt-2 text-[10px] text-cyan-200/60">
              Combo Tier: {comboTier} · Seconds per tap: {secondsPerTap}s
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-2 border-t border-[hsl(var(--border))] pt-4">
          <button
            onClick={handleContinue}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-medium',
              'bg-cyan-600 text-white hover:bg-cyan-700',
              'active:bg-cyan-800'
            )}
          >
            <Trophy className="mr-1 h-4 w-4" /> Continue Mission
          </button>
          <button
            onClick={handleContinue}
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
    cargoHold: [
      { symbol: 'Au', quantity: 15 },
      { symbol: 'Fe', quantity: 40 },
      { symbol: 'C', quantity: 30 },
    ],
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
    cargoHold: [
      { symbol: 'Fe', quantity: 40 },
      { symbol: 'Si', quantity: 20 },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '**PirateEncounterModal** with Iron in the hold — demonstrates that any Periodic Table element can be targeted. Evasion uses cadence-scaling clicker mechanic.',
      },
    },
  },
};
