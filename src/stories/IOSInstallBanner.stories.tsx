import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, DownloadCloud, Smartphone } from "lucide-react";

interface IOSInstallBannerProps {
  onDismiss?: () => void;
  isVisible?: boolean;
}

export const IOSInstallBanner = ({
  onDismiss,
  isVisible = true,
}: IOSInstallBannerProps) => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!isVisible) return null;

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true);

  if (isStandalone) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[430px]",
        "pb-[var(--sab,34px)]"
      )}
      role="dialog"
      aria-label="Install app"
    >
      <div className="bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.5)] p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-600/20 flex items-center justify-center">
            <DownloadCloud className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-cyan-100">
              Install Space Explorer
            </h3>
            <p className="text-xs text-cyan-200/60 mt-1">
              Add to Home Screen to play offline and avoid Safari's 7-day data
              wipe. Your progress stays safe.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-cyan-900/30 text-cyan-200/60 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            disabled={!deferredPrompt}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium",
              "bg-cyan-600 text-white",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "active:bg-cyan-700"
            )}
          >
            <Smartphone className="w-4 h-4" />
            <span>Add to Home Screen</span>
          </button>
          <button
            onClick={onDismiss}
            className={cn(
              "px-4 py-2.5 rounded-lg text-sm font-medium",
              "bg-cyan-900/30 border border-cyan-700/50 text-cyan-300",
              "hover:bg-cyan-800/30 active:bg-cyan-900"
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

const meta: Meta<typeof IOSInstallBanner> = {
  title: "AppShell/IOSInstallBanner",
  component: IOSInstallBanner,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "iphone14" },
  },
};

export default meta;
type Story = StoryObj<typeof IOSInstallBanner>;

export const DefaultSafariPrompt: Story = {
  args: {
    isVisible: true,
    onDismiss: () => console.log("Banner dismissed"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Anchored above bottom safe area (pb-[var(--sab)]), instructing iOS Safari users to tap **Share** → **Add to Home Screen** to prevent Safari's 7-day storage wipe. Includes working dismiss button.",
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
          "Banner automatically hides when running in standalone mode (already installed as PWA) or when dismissed.",
      },
    },
  },
};