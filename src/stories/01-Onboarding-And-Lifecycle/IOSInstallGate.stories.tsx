import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, DownloadCloud, Smartphone } from 'lucide-react';

interface IOSInstallGateProps {
  onDismiss?: () => void;
  isVisible?: boolean;
}

const IOSInstallGate = ({ onDismiss, isVisible = true }: IOSInstallGateProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isVisible) return null;

  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true);

  if (isStandalone) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[430px]',
        'pb-[var(--sab,34px)]'
      )}
      role="dialog"
      aria-label="Install app"
    >
      <div className="rounded-t-xl border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/20">
            <DownloadCloud className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground">Install Space Explorer</h3>
            <p className="mt-1 text-xs text-secondary-foreground/60">
              Add to Home Screen to play offline and avoid Safari's 7-day data wipe. Your progress
              stays safe.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 rounded-lg p-1 text-secondary-foreground/60 transition-colors hover:bg-secondary/30"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            disabled={!deferredPrompt}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
              'bg-primary text-primary-foreground',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'active:bg-primary-active'
            )}
          >
            <Smartphone className="h-4 w-4" />
            <span>Add to Home Screen</span>
          </button>
          <button
            onClick={onDismiss}
            className={cn(
              'rounded-lg px-4 py-2.5 text-sm font-medium',
              'border border-secondary/50 bg-secondary/30 text-secondary-foreground',
              'hover:bg-secondary-hover/30 active:bg-secondary-active'
            )}
          >
            Later
          </button>
        </div>
      </div>
      <div className="h-[var(--sab,34px)]" />
    </div>
  );
};

const meta: Meta<typeof IOSInstallGate> = {
  title: '01-Onboarding-And-Lifecycle/IOSInstallGate',
  component: IOSInstallGate,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'iphone14' },
  },
};

export default meta;
type Story = StoryObj<typeof IOSInstallGate>;

export const BlockingSafariPrompt: Story = {
  args: {
    isVisible: true,
    onDismiss: () => console.log('Banner dismissed'),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Blocking overlay shown on mobile Safari when !standalone, guiding the user through Share → 'Add to Home Screen'. Full-screen blocking gate to prevent Safari's 7-day ITP storage wipe.",
      },
    },
  },
};

export const HiddenWhenInstalled: Story = {
  args: {
    isVisible: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Banner automatically hides when running in standalone mode (already installed as PWA) or when dismissed.',
      },
    },
  },
};

export const AccessibleFromMenu: Story = {
  args: {
    isVisible: true,
    onDismiss: () => console.log('Banner dismissed from menu'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Banner can also be dismissed via the System Menu → Install Guide, not just the bottom overlay.',
      },
    },
  },
};
