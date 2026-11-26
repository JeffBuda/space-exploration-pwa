import { Rocket, Box, Zap, Shield } from 'lucide-react';

interface TopHudBarProps {
  systemName: string;
  credits: number;
  energy: number;
  onSettingsClick?: () => void;
}

export function TopHudBar({ systemName, credits, energy, onSettingsClick }: TopHudBarProps) {
  return (
    <div className="fixed left-0 right-0 top-0 z-10 mx-auto max-w-[430px] border-b border-slate-600 bg-slate-900 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-600/20">
            <Rocket className="h-3 w-3 text-cyan-400" />
          </div>
          <h2 className="text-sm font-bold text-cyan-100">{systemName}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Box className="h-4 w-4 text-yellow-400" />
            <span className="font-mono font-bold text-yellow-300">{credits.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="font-mono font-bold text-cyan-300">{energy}</span>
          </div>
          <button
            className="flex-shrink-0 rounded-lg p-1 text-cyan-200/60 transition-colors hover:bg-cyan-900/30"
            aria-label="Settings"
            onClick={onSettingsClick}
          >
            <Shield className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
