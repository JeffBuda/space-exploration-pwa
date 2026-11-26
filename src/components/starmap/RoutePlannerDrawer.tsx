import * as Vaul from 'vaul';
import { StarMapController } from '@/hooks/useStarMap';
import { cn } from '@/lib/utils';
import { RouteSummary } from './RouteSummary';
import { TransitControls } from './TransitControls';
import { RouteActions } from './RouteActions';

interface RoutePlannerDrawerProps {
  snapPoint: number;
  onSnapPointChange: (snapPoint: number | string | null) => void;
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

export function RoutePlannerDrawer({ snapPoint, onSnapPointChange, map }: RoutePlannerDrawerProps) {
  return (
    <Vaul.Drawer.Root
      snapPoints={[0.15, 0.35, 0.65]}
      activeSnapPoint={snapPoint}
      setActiveSnapPoint={onSnapPointChange}
      modal={false}
      dismissible={false}
      noBodyStyles
    >
      <Vaul.Drawer.Portal>
        <Vaul.Drawer.Overlay className="fixed inset-0 z-[50] bg-black/70" />
        <Vaul.Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 max-h-[65vh] overflow-y-auto rounded-t-xl border bg-card text-card-foreground shadow-lg',
            'overscroll-contain',
            'pointer-events-auto'
          )}
        >
          <RouteDrawerBody map={map} />
        </Vaul.Drawer.Content>
      </Vaul.Drawer.Portal>
    </Vaul.Drawer.Root>
  );
}
