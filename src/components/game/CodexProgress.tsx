interface CodexProgressProps {
  discoveredCount: number;
  complete: boolean;
}

export function CodexProgress({ discoveredCount, complete }: CodexProgressProps) {
  return (
    <div className="mt-3 rounded-lg border border-slate-600/50 bg-slate-900/20 p-2">
      <p className="mb-1 text-xs font-medium text-cyan-300">Discovery Codex</p>
      <div className="flex items-baseline gap-1 text-[10px] text-cyan-200">
        <span>{discoveredCount}</span>
        <span className="text-slate-500">/ 118</span>
      </div>
      {complete && (
        <p className="mt-1 text-[10px] font-medium text-yellow-400">
          CODEX COMPLETE — ENDLESS PLAY MODE UNLOCKED
        </p>
      )}
    </div>
  );
}
