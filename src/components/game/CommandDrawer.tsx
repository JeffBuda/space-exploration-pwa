import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Zap } from 'lucide-react';
import { getElementBySymbol } from '@/lib/game';
import { type PeriodicElement } from '@/lib/elements';
import { CargoHoldList } from './CargoHoldList';
import { ElementSelector } from './ElementSelector';
import { MiningControls } from './MiningControls';
import { CodexProgress } from './CodexProgress';

interface CommandDrawerProps {
  energy: number;
  cargoHold: { symbol: string; quantity: number }[];
  discoveredCount: number;
  codexComplete: boolean;
  onMine: (element: PeriodicElement) => void;
  onRecharge: () => void;
}

export function CommandDrawer({
  energy,
  cargoHold,
  discoveredCount,
  codexComplete,
  onMine,
  onRecharge,
}: CommandDrawerProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const totalUnits = cargoHold.reduce((sum, c) => sum + c.quantity, 0);
  const element = selectedSymbol ? getElementBySymbol(selectedSymbol) : undefined;

  const handleSelect = (symbol: string) => {
    setSelectedSymbol((prev) => (prev === symbol ? null : symbol));
  };

  const handleMine = () => {
    if (element) onMine(element);
  };

  return (
    <Drawer snapPoints={[0.15, 0.35, 0.65]} activeSnapPoint={0.35}>
      <DrawerTrigger asChild>
        <button className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-600 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-600/30">
          <Zap className="h-4 w-4" /> Actions
        </button>
      </DrawerTrigger>
      <DrawerOverlay className="fixed inset-0 z-[50] bg-black/70" />
      <DrawerContent className="max-h-[65vh]">
        <DrawerTitle>Command Drawer</DrawerTitle>
        <div className="space-y-3 p-3">
          <div className="space-y-2">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-cyan-300">Cargo Hold (Unlimited)</p>
              <span className="text-[10px] text-slate-400">{totalUnits} units</span>
            </div>
            <CargoHoldList cargoHold={cargoHold} />
          </div>
          <ElementSelector selectedSymbol={selectedSymbol} onSelect={handleSelect} />
          <MiningControls
            selectedSymbol={selectedSymbol}
            energy={energy}
            onMine={handleMine}
            onRecharge={onRecharge}
          />
          <CodexProgress discoveredCount={discoveredCount} complete={codexComplete} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
