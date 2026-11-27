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
    <div className="mt-6 flex gap-2 border-t border-secondary/50 pt-4">
      {outcome === 'failed' && (
        <button
          onClick={onContinue}
          className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover active:bg-primary-active"
        >
          <Trophy className="mr-1 h-4 w-4" /> Continue Mission
        </button>
      )}
      {outcome === 'evaded' && (
        <button
          onClick={onContinue}
          className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover active:bg-primary-active"
        >
          <Target className="mr-1 h-4 w-4" /> Mission Continues
        </button>
      )}
      <button
        onClick={onDismiss}
        className="flex-1 rounded-lg border border-secondary/50 bg-secondary/30 py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary-hover/30 active:bg-secondary-active"
      >
        <Menu className="mr-1 h-4 w-4" /> Main Menu
      </button>
    </div>
  );
}
