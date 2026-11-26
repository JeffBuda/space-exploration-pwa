import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Target, Trophy, Menu, X } from 'lucide-react';

interface VictoryCodexModalProps {
  onClose?: () => void;
}

const VictoryCodexModal = ({ onClose }: VictoryCodexModalProps) => {
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
            <h2 className="text-xl font-bold text-green-400">
              <Target className="mr-2 h-5 w-5" /> Codex Complete
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

        {/* Victory message */}
        <div className="mb-8 text-center">
          <p className="text-3xl font-bold text-green-400">All 118 Elements Discovered!</p>
          <p className="mt-2 text-[10px] text-cyan-300/60">Periodic Discovery Codex Complete</p>
          <p className="mb-4 text-[10px] text-green-300/60">Endless Play Mode Unlocked</p>
        </div>

        {/* Codex progress */}
        <div className="mb-6 rounded-lg border border-green-600/30 bg-green-900/20 p-3">
          <p className="text-[10px] font-medium text-green-300">Discovery Progress</p>
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
        <div className="mt-6 flex gap-2 border-t border-[hsl(var(--border))] pt-4">
          <button
            onClick={() => setOpen(false)}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-medium',
              'bg-cyan-600 text-white hover:bg-cyan-700',
              'active:bg-cyan-800'
            )}
          >
            <Trophy className="mr-1 h-4 w-4" /> Continue Endless Play
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

const meta: Meta<typeof VictoryCodexModal> = {
  title: '04-Hazards-And-Endgame/VictoryCodexModal',
  component: VictoryCodexModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'iphone14' },
  },
};

export default meta;
type Story = StoryObj<typeof VictoryCodexModal>;

export const All118ElementsComplete: Story = {
  args: {
    onClose: () => console.log('Closed'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Triggered when the 118th Periodic Table element is logged in the Codex, celebrating the Win State and unlocking Endless Play Mode. All 118 Periodic Table elements discovered.',
      },
    },
  },
};
