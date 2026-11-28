import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StarMapCanvas } from '@/components/map/StarMapCanvas';
import { RouteTab } from '@/components/drawer/RouteTab';
import { useStarMap } from '@/hooks/useStarMap';
import { computeRouteSummary } from '@/engine/routeEngine';
import { GAME_CONSTANTS } from '@/engine/constants';
import type { ActiveTransitVisual, MapInteractionMode } from '@/engine/mapTypes';

interface StarMapDemoProps {
  initialRoute?: readonly string[];
  initialEnergy?: number;
  initialCredits?: number;
  initialPhase?: 'idle' | 'in-transit' | 'arrived';
  initialAmbush?: boolean;
  mode?: MapInteractionMode;
  inspectedNodeId?: string | null;
  activeTransit?: ActiveTransitVisual | null;
  initialZoom?: number;
}

/**
 * Self-contained Star Map demo: drives the interactive canvas with the
 * `useStarMap` controller and renders the RouteTab planner (including the
 * frontier "Chart Sector Edge" affordance) beneath it.
 */
function StarMapDemo({
  initialRoute = ['sol'],
  initialEnergy = 100,
  initialCredits = 100,
  initialPhase = 'idle',
  initialAmbush = false,
  mode: initialMode = 'edit_route',
  inspectedNodeId: initialInspected = null,
  activeTransit = null,
  initialZoom = 0.2,
}: StarMapDemoProps) {
  const controller = useStarMap({
    initialRoute,
    initialEnergy,
    initialCredits,
    initialPhase,
    initialAmbush,
  });
  const [mode, setMode] = useState<MapInteractionMode>(initialMode);
  const [inspectedId, setInspectedId] = useState<string | null>(initialInspected);

  const currentNode = controller.nodes[controller.currentSystem];
  const summary = computeRouteSummary(
    controller.nodes,
    controller.edges,
    controller.currentSystem,
    controller.route,
    controller.energy
  );

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <StarMapCanvas
        nodes={controller.nodes}
        edges={[...controller.edges]}
        currentLocationId={controller.currentSystem}
        activeRoute={controller.route}
        mode={mode}
        inspectedNodeId={inspectedId}
        activeTransit={activeTransit}
        onModeChange={setMode}
        onEditModeNodeTap={controller.plotStar}
        onInfoModeNodeTap={setInspectedId}
        initialZoom={initialZoom}
      />
      <div className="absolute inset-x-0 bottom-0 z-50 max-h-[65vh] overflow-y-auto rounded-t-xl border bg-card shadow-lg">
        <RouteTab
          currentNode={currentNode}
          summary={summary}
          currentEnergy={controller.energy}
          maxEnergy={GAME_CONSTANTS.MAX_ENERGY}
          mode={mode}
          inspectedNode={inspectedId ? controller.nodes[inspectedId] : null}
          routeError={null}
          isScanningFrontier={false}
          frontierScanRemainingSeconds={GAME_CONSTANTS.FRONTIER_SCAN_DURATION_SECONDS / 60}
          onRemoveStopAtIndex={() => {}}
          onClearRoute={controller.clearRoute}
          onEngageWarp={controller.engage}
          onCloseInspectedNode={() => setInspectedId(null)}
          onTriggerFrontierScan={controller.triggerFrontierScan}
        />
      </div>
    </div>
  );
}

const meta: Meta<typeof StarMapDemo> = {
  title: '02-Core-Shell-And-Map/StarMapCanvas',
  component: StarMapDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'iphone14' },
  },
};

export default meta;
type Story = StoryObj<typeof StarMapDemo>;

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
    mode: 'edit_route',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Single hop selected: Sol → Proxima Centauri. RouteTab shows energy cost and travel time. Tap Proxima again to sever, tap another reachable star to extend.',
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
    mode: 'edit_route',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Multi-hop contiguous route: Sol → Proxima Centauri → Kepler-186. Route lines animate along active edges. Tap an intermediate node to sever the tail, tap another reachable star to extend.',
      },
    },
  },
};

export const _04_SystemInfoMode_ReadOnlyPeekAndFrontierScan: Story = {
  name: '04_SystemInfoMode_ReadOnlyPeekAndFrontierScan',
  args: {
    initialRoute: ['sol', 'proxima'],
    initialEnergy: 100,
    initialCredits: 100,
    mode: 'info',
    // Proxima Centauri is a discovered frontier system → Chart Sector Edge is available.
    inspectedNodeId: 'proxima',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Info mode (read-only): tapping Proxima Centauri opens the System Telemetry peek card. Because it is a frontier system, the "Chart Sector Edge (5 EN · 2m)" button is enabled — tapping it deducts 5 EN and charts two new procedural star systems live on the canvas.',
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
    mode: 'edit_route',
    // Live fractional transit visual: ship interpolating along the Sol → Proxima edge.
    activeTransit: { fromNodeId: 'sol', toNodeId: 'proxima', progressRatio: 0.35 },
  },
  parameters: {
    docs: {
      description: {
        story:
          'In transit: active warp for Sol → Proxima Centauri → Tau Ceti. The glowing TransitMarker interpolates along the Sol→Proxima hyperlane (progressRatio 0.35). RouteTab shows the hop progress bar, Cancel Hop, and the live Exponential Time-Skip Clicker (-1s initial tap, scaling via Math.pow(1.35, comboTier)).',
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
          'Arriving at frontier system Cygnus-X triggers a pirate ambush! Evasion uses the cadence-scaling clicker mechanic — tap faster to build the probability gauge, then attempt evasion. A failed ambush loses a random cargo slot.',
      },
    },
  },
};
