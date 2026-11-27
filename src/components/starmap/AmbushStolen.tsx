interface PiratedCargo {
  symbol: string;
  name: string;
  quantity: number;
}

interface AmbushStolenProps {
  stolen?: PiratedCargo | null;
  evaded?: boolean;
}

export function AmbushStolen({ stolen, evaded }: AmbushStolenProps) {
  if (evaded) {
    return (
      <div className="mb-3 rounded-lg border border-success bg-success-bg/30 p-3">
        <p className="text-[10px] text-success">Evaded with 0 loss!</p>
      </div>
    );
  }

  if (!stolen) return null;

  return (
    <div className="mb-3 rounded-lg border border-warning bg-warning-bg/20 p-3">
      <p className="mb-2 text-[10px] font-medium text-warning">Cargo Stolen</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-warning">{stolen.name}</span>
        <span className="text-[10px] text-warning/60">{stolen.symbol}</span>
      </div>
      <p className="text-[10px] text-warning">
        Quantity stolen: <span className="font-mono text-warning">{stolen.quantity}</span>
      </p>
    </div>
  );
}
