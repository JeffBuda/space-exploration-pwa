import type { Meta, StoryObj } from '@storybook/react';
import { Rocket, Settings, Zap } from 'lucide-react';
import { formatCredits, MAX_ENERGY, ENERGY_REGEN_PER_MINUTE } from '@/lib/game';

interface TopHudBarProps {
  systemName: string;
  credits: number;
  energy: number;
  onSettingsClick?: () => void;
}

const TopHudBar = ({ systemName, credits, energy, onSettingsClick }: TopHudBarProps) => {
  return (
    <div className="fixed left-0 right-0 top-0 z-10 mx-auto max-w-[430px] border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
            <Rocket className="h-3 w-3 text-primary" />
          </div>
          <h2 className="text-sm font-bold text-foreground">{systemName}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rarity-legendary/20 text-[10px] text-rarity-legendary">
              C
            </span>
            <span className="font-mono font-bold text-rarity-legendary">
              {formatCredits(credits)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-mono font-bold text-secondary-foreground">
              {energy} / {MAX_ENERGY} EN
            </span>
          </div>
          <button
            onClick={onSettingsClick}
            className="flex-shrink-0 rounded-lg p-1.5 text-secondary-foreground/60 transition-colors hover:bg-[hsl(var(--secondary))]"
            aria-label="Settings / Menu"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="mt-1 flex items-center justify-end">
        <span className="font-mono text-[10px] text-secondary-foreground/60">
          +{ENERGY_REGEN_PER_MINUTE.toFixed(1)} EN/min passive solar
        </span>
      </div>
    </div>
  );
};

const meta: Meta<typeof TopHudBar> = {
  title: '02-Core-Shell-And-Map/TopHudBar',
  component: TopHudBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'iphone14' },
  },
};

export default meta;
type Story = StoryObj<typeof TopHudBar>;

export const Default: Story = {
  args: {
    systemName: 'Sol',
    credits: 100,
    energy: 100,
    onSettingsClick: () => console.log('Settings opened'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Read-only persistent header displaying: System Name (Sol), Credits as integer (100 CR), Remaining Energy (100 / 100 EN), and Settings/Menu button (⚙). All on iOS portrait viewport (390×844px).',
      },
    },
  },
};

export const LowEnergy: Story = {
  args: {
    systemName: 'Proxima Centauri',
    credits: 0,
    energy: 12,
    onSettingsClick: () => console.log('Settings opened'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Low-energy state: Credits displayed as whole integer, Energy (12 / 100 EN). Engage Warp should be disabled when totalRouteEnergyCost > currentEnergy (handled in StarMapCanvas stories).',
      },
    },
  },
};
