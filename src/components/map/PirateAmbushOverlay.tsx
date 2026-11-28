import { cn } from '@/lib/utils';

export interface PirateAmbushOverlayProps {
  remainingSeconds: number;
  charge: number;
  threshold: number;
  comboTier: number;
  secondsPerTap: number;
  onTap: () => void;
  cargoLost?: string | null;
  phase: 'none' | 'active' | 'evaded' | 'failed';
  onDismiss?: () => void;
}

function PirateChargeBar({ charge, threshold }: { charge: number; threshold: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((charge / threshold) * 100)));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full bg-[hsl(var(--color-warning))] transition-all duration-100"
        style={{ width: `${pct}%` }}
        data-testid="pirate-charge-bar"
      />
    </div>
  );
}

function PirateClickerButton({
  comboTier,
  secondsPerTap,
  onClick,
}: {
  comboTier: number;
  secondsPerTap: number;
  onClick: () => void;
}) {
  const label = comboTier <= 0 ? '1x / +1' : `x${comboTier} / +${secondsPerTap}`;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl bg-[hsl(var(--color-danger))] py-3 text-sm font-bold text-[hsl(var(--destructive-foreground))] shadow-lg transition-transform active:scale-[0.99]"
      data-testid="pirate-clicker-button"
    >
      💥 Evade! <span className="ml-2 font-mono text-xs">{label}</span>
    </button>
  );
}

// eslint-disable-next-line max-lines-per-function
export function PirateAmbushOverlay(props: PirateAmbushOverlayProps) {
  const {
    remainingSeconds,
    charge,
    threshold,
    comboTier,
    secondsPerTap,
    onTap,
    cargoLost,
    phase,
    onDismiss,
  } = props;

  if (phase === 'none') return null;

  const isResolved = phase === 'evaded' || phase === 'failed';

  return (
    <div
      data-testid="pirate-ambush-overlay"
      className="z-60 fixed inset-0 flex select-none flex-col items-center justify-center bg-background/95 p-6 font-sans backdrop-blur-sm"
    >
      <div className="w-full max-w-[360px] space-y-4 rounded-2xl border border-[hsl(var(--color-danger-border))] bg-card p-5 shadow-2xl">
        <div className="flex items-center gap-2 text-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--color-danger-bg))]">
            <span className="text-xl text-[hsl(var(--color-danger))]">☠</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-[hsl(var(--color-danger))]">
              Pirate Interception!
            </div>
            <div className="text-xs text-muted-foreground">
              Mid-warp ambush — rapid tap to evade
            </div>
          </div>
          <div className="font-mono text-xs text-muted-foreground">{remainingSeconds}s</div>
        </div>

        <PirateChargeBar charge={charge} threshold={threshold} />

        {isResolved ? (
          <div className="space-y-2 text-center">
            <div
              className={cn(
                'text-sm font-bold',
                phase === 'evaded'
                  ? 'text-[hsl(var(--color-success))]'
                  : 'text-[hsl(var(--color-danger))]'
              )}
            >
              {phase === 'evaded'
                ? '✓ Evaded — 0 cargo lost'
                : `✗ Failed — Lost ${cargoLost ?? 'cargo'}`}
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="w-full rounded-lg bg-secondary py-2 text-xs font-bold text-secondary-foreground"
            >
              Resume Transit
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <PirateClickerButton
              comboTier={comboTier}
              secondsPerTap={secondsPerTap}
              onClick={onTap}
            />
            <div className="text-center text-[10px] text-muted-foreground">
              Tap rapidly to fill charge bar before {remainingSeconds}s expires
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
