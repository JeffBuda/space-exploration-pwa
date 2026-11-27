import type { Meta, StoryObj } from '@storybook/react';
import { StarMapCanvas } from '@/components/StarMapCanvas';

const meta: Meta<typeof StarMapCanvas> = {
  title: '02-Core-Shell-And-Map/StarMapCanvas',
  component: StarMapCanvas,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'iphone14' },
  },
};

export default meta;
type Story = StoryObj<typeof StarMapCanvas>;

export const _01_SolIdleDefault: Story = {
  name: '01_SolIdleDefault',
  args: {
    initialRoute: ['sol'],
    initialEnergy: 100,
    initialCredits: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Starting in Sol with adjacent unknown systems visible. Sol is active (green), adjacent nodes dimmed but reachable. No route plotted. 44×44px minimum touch hitboxes on every node.',
      },
    },
  },
};

export const _02_SingleHopSelected: Story = {
  name: '02_SingleHopSelected',
  args: {
    initialRoute: ['sol', 'proxima'],
    initialEnergy: 100,
    initialCredits: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Single hop selected: Sol → Proxima Centauri. Drawer shows energy cost (42) and travel time (2m 6s). Tap Proxima again to sever, tap another reachable star to extend.',
      },
    },
  },
};

export const _03_MultiHopItinerary: Story = {
  name: '03_MultiHopItinerary',
  args: {
    initialRoute: ['sol', 'proxima', 'kepler'],
    initialEnergy: 100,
    initialCredits: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Multi-hop contiguous route: Sol → Proxima Centauri → Kepler-186 (93 EN total). Route lines animate along active edges. Tap an intermediate node to sever the tail, tap another reachable star to extend. Engage Warp enabled since energy is sufficient.',
      },
    },
  },
};

export const _04_InsufficientEnergyBlocked: Story = {
  name: '04_InsufficientEnergyBlocked',
  args: {
    initialRoute: ['sol', 'proxima', 'kepler', 'cygnus'],
    initialEnergy: 50,
    initialCredits: 100,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Insufficient energy: route costs 188 EN against 50 EN available, so Engage Warp is disabled and shows a red warning text.',
      },
    },
  },
};

export const _05_InTransitWithCancelNearestNode: Story = {
  name: '05_InTransitWithCancelNearestNode',
  args: {
    initialRoute: ['sol', 'proxima', 'tauceti'],
    initialEnergy: 100,
    initialCredits: 100,
    initialPhase: 'in-transit',
  },
  parameters: {
    docs: {
      description: {
        story:
          'In transit: Active warp countdown for Sol → Proxima Centauri → Tau Ceti. Drawer shows hop progress bar with Cancel Hop and live Exponential Time-Skip Clicker (-1s initial tap, scaling via Math.pow(1.35,comboTier)).',
      },
    },
  },
};

export const _06_PirateAmbushEncounter: Story = {
  name: '06_PirateAmbushEncounter',
  args: {
    initialRoute: ['sol', 'proxima', 'kepler', 'cygnus'],
    initialEnergy: 100,
    initialCredits: 100,
    initialPhase: 'arrived',
    initialAmbush: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Arriving at frontier system Cygnus-X triggers a pirate ambush! Evasion uses cadence-scaling clicker mechanic — tap faster to build probability gauge, then attempt evasion. Failed ambush loses a random cargo slot.',
      },
    },
  },
};
