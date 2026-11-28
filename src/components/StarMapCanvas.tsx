import { useStarMap, StarMapController } from '@/hooks/useStarMap';
import { TopHudBar } from '@/components/game/TopHudBar';
import { StarMapGraph } from '@/components/starmap/StarMapGraph';
import { RoutePlannerDrawer } from '@/components/starmap/RoutePlannerDrawer';
import { PirateAmbushModal } from '@/components/starmap/PirateAmbushModal';

export interface StarMapCanvasProps {
  initialRoute?: readonly string[];
  initialEnergy?: number;
  initialCredits?: number;
  initialPhase?: 'idle' | 'in-transit' | 'arrived';
  initialAmbush?: boolean;
}

export function StarMapCanvas({
  initialRoute = ['sol'],
  initialEnergy = 100,
  initialCredits = 100,
  initialPhase = 'idle',
  initialAmbush = false,
}: StarMapCanvasProps) {
  const map: StarMapController = useStarMap({
    initialRoute,
    initialEnergy,
    initialCredits,
    initialPhase,
    initialAmbush,
  });

  return (
    <div className="relative h-screen overflow-x-hidden bg-[#0d1117]">
      {/* Top HUD Bar */}
      <TopHudBar
        systemName={map.currentSystem}
        credits={map.credits}
        energy={map.energy}
        onSettingsClick={() => console.log('Settings / Menu opened')}
      />

      {/* Star Map Graph */}
      <StarMapGraph
        route={map.route}
        selectedStar={map.droppedAt ?? undefined}
        onStarClick={map.plotStar}
        inTransit={map.phase === 'in-transit'}
      />

      {/* Route Planner Drawer */}
      <RoutePlannerDrawer map={map} />

      {/* Pirate Ambush Modal */}
      <PirateAmbushModal active={map.isAmbushActive} map={map} />
    </div>
  );
}
