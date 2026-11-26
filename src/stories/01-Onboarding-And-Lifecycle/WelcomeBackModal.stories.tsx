import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Menu, X } from 'lucide-react';

// ── Time formatting helpers ─────────────────────────────────────────────
function formatDHMS(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface WelcomeBackModalProps {
  onClose?: () => void;
  offlineDurationSeconds?: number;
  energyRegenerated?: number; // EN units regenerated (1.0 EN/min uncapped offline)
  logEntries?: string[];
}

const WelcomeBackModal = ({
  onClose,
  offlineDurationSeconds = 42 * 60,
  energyRegenerated = 42, // 42 min * 1.0 EN/min
  logEntries = [],
}: WelcomeBackModalProps) => {
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
        {/* Header with drag handle */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-cyan-100">Welcome Back, Captain</h2>
            <p className="text-sm text-cyan-200/60">
              Away for <span className="font-medium">{formatDHMS(offlineDurationSeconds)}</span>
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-cyan-200/60 transition-colors hover:bg-cyan-900/30"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Energy regenerated (uncapped, 1.0 EN/min) */}
        <div className="mb-4 border-t border-[hsl(var(--border))] pt-4">
          <p className="mb-1 text-xs text-cyan-300">Solar Energy Regenerated</p>
          <p className="font-mono text-xl font-bold text-cyan-300">
            {energyRegenerated} EN
          </p>
          <p className="text-[10px] text-cyan-200/60">
            1.0 EN/min passive solar panels (no offline time cap)
          </p>
        </div>

        {/* Tier 1 Summary */}
        <div className="mb-4">
          <p className="mb-2 text-sm text-cyan-200/60">
            Tier 1 — Glanceable Summary (Default / Collapsed Drawer)
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-cyan-300">Distance Traveled:</span>
            <span className="font-medium text-cyan-100">LY traveled during offline</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-cyan-300">Passive Credits Earned:</span>
            <span className="font-medium text-cyan-100">
              {Math.floor(offlineDurationSeconds / 60)} Credits
            </span>
          </div>
        </div>

        {/* Captain's Log */}
        {logEntries.length > 0 && (
          <div className="mb-4 rounded-lg border border-cyan-700/30 bg-cyan-900/20 p-3">
            <p className="mb-1 text-xs font-medium text-cyan-300">Captain's Log</p>
            <div className="space-y-1 text-xs text-cyan-200/60">
              {logEntries.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="mr-2 text-sm text-cyan-400">{entry}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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

const meta: Meta<typeof WelcomeBackModal> = {
  title: '01-Onboarding-And-Lifecycle/WelcomeBackModal',
  component: WelcomeBackModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'iphone14' },
  },
};

export default meta;
type Story = StoryObj<typeof WelcomeBackModal>;

export const OfflineResumption: Story = {
  args: {
    offlineDurationSeconds: 42 * 60,
    energyRegenerated: 42, // 42m @ 1.0 EN/min
    logEntries: ['Departed Sol system', 'Collected solar data', 'Mined ice crystals'],
    onClose: () => console.log('Closed'),
  },
  parameters: {
    docs: {
      description: {
        story:
          "**WelcomeBackModal**: Displays DD:HH:MM:SS offline elapsed time (42m 00s), passive Solar Energy regenerated (uncapped, 42 EN at the 1.0 EN/min onboard solar rate), and completed timer resolutions. Captain's Log with event entries.",
      },
    },
  },
};

export const WelcomeBack24Hours: Story = {
  args: {
    offlineDurationSeconds: 24 * 60 * 60,
    energyRegenerated: 1440, // 24h * 1.0 EN/min
    logEntries: [
      'Long exploration mission completed',
      'Multiple system discoveries',
      'Extensive resource mining',
    ],
    onClose: () => console.log('Closed'),
  },
  parameters: {
    docs: {
      description: {
        story:
          "**WelcomeBackModal** with 24h offline duration: shows extended DD:HH:MM:SS format, 1440 EN uncapped solar energy regen, and comprehensive Captain's Log.",
      },
    },
  },
};
