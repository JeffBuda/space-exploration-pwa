import { AlertTriangle, X } from 'lucide-react';

interface AmbushModalHeaderProps {
  onDismiss: () => void;
}

export function AmbushModalHeader({ onDismiss }: AmbushModalHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-xl font-bold text-warning">
        <AlertTriangle className="mr-2 h-5 w-5" /> Pirate Interception
      </h2>
      <button
        onClick={onDismiss}
        className="rounded-lg p-1 text-secondary-foreground/60 transition-colors hover:bg-secondary/30"
        aria-label="Close modal"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
