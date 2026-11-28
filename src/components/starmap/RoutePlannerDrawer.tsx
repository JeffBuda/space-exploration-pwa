import { StarMapController } from '@/hooks/useStarMap';
import { cn } from '@/lib/utils';
import { RouteSummary } from './RouteSummary';
import { TransitControls } from './TransitControls';
import { RouteActions } from './RouteActions';

interface RoutePlannerDrawerProps {
  map: StarMapController;
}

interface RouteDrawerBodyProps {
  map: StarMapController;
}

/** Presentational drawer content composed from small subcomponents. */
function RouteDrawerBody({ map }: RouteDrawerBodyProps) {
  const {
    route,
    phase,
    hopRemaining,
    droppedAt,
    hopTotalTime,
    hopTotalEnergy,
    insufficientEnergy,
    lastMessage,
    engage,
    cancelHop,
    triggerTimeSkip,
    clearRoute,
    isAmbushActive,
    cadence,
  } = map;

  return (
    <>
      <RouteSummary
        route={route}
        phase={phase}
        totalEnergy={hopTotalEnergy}
        totalTime={hopTotalTime}
        insufficientEnergy={insufficientEnergy}
        lastMessage={lastMessage}
      />

      {phase === 'in-transit' && (
        <TransitControls
          totalTime={hopTotalTime}
          hopRemaining={hopRemaining}
          droppedAt={droppedAt}
          comboTier={cadence.comboTier}
          secondsPerTap={cadence.secondsPerTap}
          onCancelHop={cancelHop}
          onTimeSkip={() => triggerTimeSkip()}
        />
      )}

      <RouteActions
        routeLength={route.length}
        phase={phase}
        isAmbushActive={isAmbushActive}
        insufficientEnergy={insufficientEnergy}
        onEngage={engage}
        onClearRoute={clearRoute}
      />
    </>
  );
}

/**
 * Route planner drawer, pinned to the bottom of the viewport at the peek snap point.
 * Kept as a plain fixed panel (rather than a portal-based Vaul drawer) so it renders
 * deterministically in isolated Storybook canvases as well as the app shell.
 */
export function RoutePlannerDrawer({ map }: RoutePlannerDrawerProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 max-h-[65vh] overflow-y-auto rounded-t-xl border bg-card text-card-foreground shadow-lg',
        'pointer-events-auto overscroll-contain'
      )}
      data-testid="route-planner-drawer"
    >
      <div className="mb-1 flex justify-center pt-2">
        <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
      </div>
      <div className="px-4 pb-4">
        <RouteDrawerBody map={map} />
      </div>
    </div>
  );
}
