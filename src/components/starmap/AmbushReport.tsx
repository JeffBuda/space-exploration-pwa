interface AmbushReportProps {
  reportTime: string;
}

export function AmbushReport({ reportTime }: AmbushReportProps) {
  return (
    <div className="mb-4 rounded-lg border border-amber-600/30 bg-amber-900/20 p-4">
      <p className="text-[10px] font-medium text-amber-300">
        Your route was intercepted by pirates {reportTime} into your hop.
      </p>
      <p className="text-[10px] text-amber-300/60">
        A random amount of cargo was stolen from your hold.
      </p>
    </div>
  );
}
