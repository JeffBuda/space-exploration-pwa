interface CodexProgressProps {
  discoveredCount: number;
  complete: boolean;
}

export function CodexProgress({ discoveredCount, complete }: CodexProgressProps) {
  return (
    <div className="mt-3 rounded-lg border border-border/50 bg-background/20 p-2">
      <p className="mb-1 text-xs font-medium text-secondary-foreground">Discovery Codex</p>
      <div className="flex items-baseline gap-1 text-[10px] text-secondary-foreground">
        <span>{discoveredCount}</span>
        <span className="text-muted-foreground">/ 118</span>
      </div>
      {complete && (
        <p className="mt-1 text-[10px] font-medium text-rarity-legendary">
          CODEX COMPLETE — ENDLESS PLAY MODE UNLOCKED
        </p>
      )}
    </div>
  );
}
