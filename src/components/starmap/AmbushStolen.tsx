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
      <div className="mb-3 rounded-lg border border-green-600/30 bg-green-900/30 p-3">
        <p className="text-[10px] text-green-300">Evaded with 0 loss!</p>
      </div>
    );
  }

  if (!stolen) return null;

  return (
    <div className="mb-3 rounded-lg border border-amber-600/30 bg-amber-900/20 p-3">
      <p className="mb-2 text-[10px] font-medium text-amber-300">Cargo Stolen</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-amber-300">{stolen.name}</span>
        <span className="text-[10px] text-amber-300/60">{stolen.symbol}</span>
      </div>
      <p className="text-[10px] text-amber-300">
        Quantity stolen: <span className="font-mono text-amber-400">{stolen.quantity}</span>
      </p>
    </div>
  );
}
