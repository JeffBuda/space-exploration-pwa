export interface InTransitScreenProps {
  fromName: string;
  toName: string;
  distanceLY: number;
  energyCost: number;
  hopIndex: number;
  totalHops: number;
  remainingSeconds: number;
  progressRatio: number;
  comboTier: number;
  secondsPerTap: number;
  onTimeSkip: () => void;
  onCancelHop: () => void;
  onEmergencyDrop: (progressRatio: number) => void;
  droppedAt?: string | null;
  arrivedAt?: string | null;
  phase: 'transit' | 'arrived' | 'dropped' | 'none';
}

function formatClock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function TransitProgress({ progressRatio }: { progressRatio: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(progressRatio * 100)));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full bg-[hsl(var(--primary))] transition-all duration-500"
        style={{ width: `${pct}%` }}
        data-testid="transit-progress-bar"
      />
    </div>
  );
}

function TransitTimeSkipButton({
  comboTier,
  secondsPerTap,
  onClick,
}: {
  comboTier: number;
  secondsPerTap: number;
  onClick: () => void;
}) {
  const label = comboTier <= 0 ? '1x / -1s' : `x${comboTier} / -${secondsPerTap}s`;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-xl bg-primary px-3 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.99]"
      data-testid="time-skip-button"
    >
      ⏩ Time-Skip <span className="ml-2 font-mono text-xs">{label}</span>
    </button>
  );
}

// eslint-disable-next-line max-lines-per-function
function TransitBottomControls(props: {
  comboTier: number;
  secondsPerTap: number;
  onTimeSkip: () => void;
  onCancelHop: () => void;
  onEmergencyDrop: (progressRatio: number) => void;
  droppedAt?: string | null;
  arrivedAt?: string | null;
  phase: InTransitScreenProps['phase'];
}) {
  const { onCancelHop, onEmergencyDrop, droppedAt, arrivedAt, phase } = props;
  const isFinished = phase === 'arrived' || phase === 'dropped';
  const message =
    phase === 'arrived'
      ? `Arrived at ${arrivedAt ?? ''}`
      : phase === 'dropped'
        ? `Emergency drop: ${droppedAt ?? 'origin'}`
        : '';
  const msgClass =
    phase === 'arrived' ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]';

  if (isFinished) {
    return (
      <div className="space-y-2 text-center">
        <div className={`text-sm font-bold ${msgClass}`}>{message}</div>
        <button
          type="button"
          onClick={() => onEmergencyDrop(1)}
          className="w-full rounded-lg bg-secondary py-2 text-xs font-bold text-secondary-foreground"
        >
          New Transit (Restart Hop)
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancelHop}
          className="flex-1 rounded-lg border border-[hsl(var(--color-danger-border))] bg-[hsl(var(--color-danger-bg))] py-2.5 text-xs font-bold text-[hsl(var(--color-danger))]"
          data-testid="cancel-hop-button"
        >
          ✕ Cancel Hop (Emergency Drop)
        </button>
        <TransitTimeSkipButton
          comboTier={props.comboTier}
          secondsPerTap={props.secondsPerTap}
          onClick={props.onTimeSkip}
        />
      </div>
      <div className="flex gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => onEmergencyDrop(0.1)}
          className="flex-1 rounded-md bg-secondary py-1.5 font-mono text-[10px] text-secondary-foreground"
          data-testid="demo-drop-origin"
        >
          Demo: Cancel @10% (→ Origin)
        </button>
        <button
          type="button"
          onClick={() => onEmergencyDrop(0.6)}
          className="flex-1 rounded-md bg-secondary py-1.5 font-mono text-[10px] text-secondary-foreground"
          data-testid="demo-drop-target"
        >
          Demo: Cancel @60% (→ Target)
        </button>
      </div>
    </div>
  );
}

export function InTransitScreen(props: InTransitScreenProps) {
  const {
    fromName,
    toName,
    distanceLY,
    energyCost,
    hopIndex,
    totalHops,
    remainingSeconds,
    progressRatio,
    phase,
  } = props;

  if (phase === 'none') return null;

  return (
    <div
      data-testid="in-transit-screen"
      className="fixed inset-0 z-50 flex select-none flex-col items-center justify-center bg-background/95 p-6 font-sans backdrop-blur-sm"
    >
      <div className="w-full max-w-[360px] space-y-4 rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-warning))]">
            In Transit
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            Hop {hopIndex + 1} / {totalHops}
          </div>
        </div>

        <div className="space-y-1 text-center">
          <div className="text-sm font-semibold text-foreground">
            {fromName} → {toName}
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            {distanceLY} LY · {energyCost} EN
          </div>
        </div>

        <TransitProgress progressRatio={progressRatio} />

        <div className="text-center">
          <div className="font-mono text-2xl font-bold text-primary">
            {formatClock(remainingSeconds)}
          </div>
          <div className="text-[10px] uppercase text-muted-foreground">Remaining</div>
        </div>

        <TransitBottomControls
          onCancelHop={props.onCancelHop}
          onEmergencyDrop={props.onEmergencyDrop}
          droppedAt={props.droppedAt}
          arrivedAt={props.arrivedAt}
          phase={props.phase}
          comboTier={props.comboTier}
          secondsPerTap={props.secondsPerTap}
          onTimeSkip={props.onTimeSkip}
        />
      </div>
    </div>
  );
}
