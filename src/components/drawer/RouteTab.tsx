import { GAME_CONSTANTS } from '@/engine/constants';
import { formatDuration } from '@/lib/game';
import type { MapInteractionMode, RouteSummary, StarNode } from '@/engine/mapTypes';

export interface RouteTabProps {
  currentNode: StarNode;
  summary: RouteSummary;
  currentEnergy: number;
  maxEnergy: number;
  mode: MapInteractionMode;
  inspectedNode: StarNode | null;
  routeError: string | null;
  isScanningFrontier?: boolean;
  frontierScanRemainingSeconds?: number;
  onRemoveStopAtIndex: (legIndex: number) => void;
  onClearRoute: () => void;
  onEngageWarp: () => void;
  onCloseInspectedNode: () => void;
  onTriggerFrontierScan?: (frontierNodeId: string) => void;
}

// eslint-disable-next-line max-lines-per-function
function SystemInfoPeekCard({
  node,
  mode,
  onClose,
  onTriggerFrontierScan,
  isScanningFrontier,
  frontierScanRemainingSeconds,
  currentEnergy,
}: {
  node: StarNode;
  mode: MapInteractionMode;
  onClose: () => void;
  onTriggerFrontierScan?: (id: string) => void;
  isScanningFrontier?: boolean;
  frontierScanRemainingSeconds?: number;
  currentEnergy: number;
}) {
  const canAffordFrontierScan = currentEnergy >= GAME_CONSTANTS.FRONTIER_SCAN_ENERGY_COST;

  return (
    <div className="space-y-2 rounded-xl border border-[hsl(var(--color-warning-border))] bg-popover p-3.5 text-popover-foreground shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--color-warning))]">
            System Telemetry {mode === 'info' ? '(Info Mode — Route Locked)' : ''}
          </div>
          <div className="text-base font-bold text-foreground">{node.name}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-secondary px-2 py-1 text-xs text-secondary-foreground hover:opacity-90"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-muted/60 p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Status</div>
          <div className="font-semibold text-foreground">
            {node.isDiscovered ? 'Discovered' : 'Uncharted'}
          </div>
        </div>
        <div className="rounded-lg bg-muted/60 p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Classification</div>
          <div
            className={`font-semibold ${node.safety === 'Safe' ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]'}`}
          >
            {node.safety}
          </div>
        </div>
        <div className="rounded-lg bg-muted/60 p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Spaceport</div>
          <div className="font-semibold text-primary">
            {node.hasSpaceport ? 'Active Port' : 'None'}
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <span>Spectral Resource Hints ({node.bodyCount} bodies): </span>
        <span className="font-mono text-[hsl(var(--color-success))]">
          {node.resourceHints.join(', ')}
        </span>
      </div>

      {node.isFrontier && onTriggerFrontierScan && (
        <button
          type="button"
          disabled={!canAffordFrontierScan || isScanningFrontier}
          onClick={() => onTriggerFrontierScan(node.id)}
          className="w-full rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-foreground transition-opacity disabled:opacity-40"
        >
          {isScanningFrontier
            ? `Scanning Sector Edge... (${frontierScanRemainingSeconds ?? 0}s)`
            : `Chart Sector Edge (${GAME_CONSTANTS.FRONTIER_SCAN_ENERGY_COST} EN · ${GAME_CONSTANTS.FRONTIER_SCAN_DURATION_SECONDS / 60}m)`}
        </button>
      )}
    </div>
  );
}

function RouteTelemetryHeader({
  currentNode,
  summary,
  currentEnergy,
}: {
  currentNode: StarNode;
  summary: RouteSummary;
  currentEnergy: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-muted/50 p-3">
      <div>
        <div className="text-[10px] font-bold uppercase text-muted-foreground">Origin Anchor</div>
        <div className="truncate text-sm font-bold text-[hsl(var(--color-success))]">
          {currentNode.name}
        </div>
      </div>
      <div className="text-center">
        <div className="text-[10px] font-bold uppercase text-muted-foreground">Route Energy</div>
        <div
          className={`font-mono text-sm font-bold ${summary.canAfford ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-danger))]'}`}
        >
          {summary.totalEnergyCost} / {currentEnergy} EN
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-bold uppercase text-muted-foreground">Total Transit</div>
        <div className="font-mono text-sm font-bold text-primary">
          {summary.legs.length > 0 ? formatDuration(summary.totalDurationSeconds) : '0m'}
        </div>
      </div>
    </div>
  );
}

function RouteItinerary({
  legs,
  currentNode,
  onRemoveStopAtIndex,
}: {
  legs: readonly {
    legIndex: number;
    toNodeId: string;
    toNodeName: string;
    distanceLY: number;
    energyCost: number;
    durationSeconds: number;
  }[];
  currentNode: StarNode;
  onRemoveStopAtIndex: (idx: number) => void;
}) {
  if (legs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
        Tap any star node on the map to auto-plot a contiguous route anchored at {currentNode.name}.
      </div>
    );
  }
  return (
    <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
      {legs.map((leg) => (
        <div
          key={leg.toNodeId}
          className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 font-mono text-[11px] font-bold text-primary">
              {leg.legIndex + 1}
            </span>
            <span className="truncate font-semibold text-foreground">{leg.toNodeName}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-mono text-muted-foreground">
              {leg.distanceLY} LY · {leg.energyCost} EN · {formatDuration(leg.durationSeconds)}
            </span>
            <button
              type="button"
              aria-label={`Remove ${leg.toNodeName}`}
              onClick={() => onRemoveStopAtIndex(leg.legIndex)}
              className="h-6 w-6 rounded-md bg-secondary font-bold text-secondary-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function RouteActionBar({
  summary,
  maxEnergy,
  onClearRoute,
  onEngageWarp,
}: {
  summary: RouteSummary;
  maxEnergy: number;
  onClearRoute: () => void;
  onEngageWarp: () => void;
}) {
  return (
    <div className="flex gap-2 pt-1">
      {summary.legs.length > 0 && (
        <button
          type="button"
          onClick={onClearRoute}
          className="rounded-xl border border-[hsl(var(--color-danger-border))] bg-[hsl(var(--color-danger-bg))] px-4 py-3 text-xs font-bold text-[hsl(var(--color-danger))]"
        >
          Clear
        </button>
      )}
      <button
        type="button"
        onClick={onEngageWarp}
        disabled={summary.legs.length === 0 || !summary.canAfford}
        className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold shadow-lg transition-colors ${
          summary.legs.length === 0
            ? 'cursor-not-allowed bg-muted text-muted-foreground'
            : !summary.canAfford
              ? 'cursor-not-allowed border border-[hsl(var(--color-danger-border))] bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]'
              : 'bg-primary text-primary-foreground active:scale-[0.99]'
        }`}
      >
        {summary.legs.length === 0
          ? 'Select Destination'
          : !summary.canAfford
            ? `Insufficient Energy (Need ${summary.energyShortfall} EN · Max ${maxEnergy})`
            : `Engage Hop 1 (${summary.legs[0].energyCost} EN)`}
      </button>
    </div>
  );
}

export function RouteTab(props: RouteTabProps) {
  const {
    currentNode,
    summary,
    currentEnergy,
    maxEnergy,
    mode,
    inspectedNode,
    routeError,
    isScanningFrontier = false,
    frontierScanRemainingSeconds = 0,
    onRemoveStopAtIndex,
    onClearRoute,
    onEngageWarp,
    onCloseInspectedNode,
    onTriggerFrontierScan,
  } = props;

  return (
    <div className="select-none space-y-3.5 bg-card p-4 font-sans text-card-foreground">
      {inspectedNode && (
        <SystemInfoPeekCard
          node={inspectedNode}
          mode={mode}
          onClose={onCloseInspectedNode}
          onTriggerFrontierScan={onTriggerFrontierScan}
          isScanningFrontier={isScanningFrontier}
          frontierScanRemainingSeconds={frontierScanRemainingSeconds}
          currentEnergy={currentEnergy}
        />
      )}

      {routeError && (
        <div className="rounded-lg border border-[hsl(var(--color-danger-border))] bg-[hsl(var(--color-danger-bg))] px-3 py-2 text-xs text-[hsl(var(--color-danger))]">
          {routeError}
        </div>
      )}

      <RouteTelemetryHeader
        currentNode={currentNode}
        summary={summary}
        currentEnergy={currentEnergy}
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase text-muted-foreground">
          <span>Anchored Itinerary ({summary.legs.length} Hops)</span>
          <span>Solar: +{GAME_CONSTANTS.PASSIVE_SOLAR_REGEN_PER_MIN.toFixed(1)} EN/m</span>
        </div>
        <RouteItinerary
          legs={summary.legs}
          currentNode={currentNode}
          onRemoveStopAtIndex={onRemoveStopAtIndex}
        />
      </div>

      <RouteActionBar
        summary={summary}
        maxEnergy={maxEnergy}
        onClearRoute={onClearRoute}
        onEngageWarp={onEngageWarp}
      />
    </div>
  );
}
