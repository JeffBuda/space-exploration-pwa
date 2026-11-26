import { Menu, Target, Trophy } from 'lucide-react';

interface AmbushOutcomeActionsProps {
  outcome: 'ready' | 'evaded' | 'failed';
  onContinue: () => void;
  onDismiss: () => void;
}

export function AmbushOutcomeActions({
  outcome,
  onContinue,
  onDismiss,
}: AmbushOutcomeActionsProps) {
  return (
    <div className="mt-6 flex gap-2 border-t border-cyan-700/50 pt-4">
      {outcome === 'failed' && (
        <button
          onClick={onContinue}
          className="flex-1 rounded-lg bg-cyan-600 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 active:bg-cyan-800"
        >
          <Trophy className="mr-1 h-4 w-4" /> Continue Mission
        </button>
      )}
      {outcome === 'evaded' && (
        <button
          onClick={onContinue}
          className="flex-1 rounded-lg bg-cyan-600 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 active:bg-cyan-800"
        >
          <Target className="mr-1 h-4 w-4" /> Mission Continues
        </button>
      )}
      <button
        onClick={onDismiss}
        className="flex-1 rounded-lg border border-cyan-700/50 bg-cyan-900/30 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-800/30 active:bg-cyan-900"
      >
        <Menu className="mr-1 h-4 w-4" /> Main Menu
      </button>
    </div>
  );
}
