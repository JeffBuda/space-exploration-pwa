import { useGame } from '@/hooks/useGame';
import { selectCodexProgress } from '@/lib/gameState';
import { TopHudBar } from '@/components/game/TopHudBar';
import { StarMapBackground } from '@/components/game/StarMapBackground';
import { CommandDrawer } from '@/components/game/CommandDrawer';

export const App = () => {
  const { state, mineElement, rechargeEnergy } = useGame();
  const { credits, energy, cargoHold, discoveredElements } = state;
  const { complete } = selectCodexProgress(state);

  const handleRecharge = () => rechargeEnergy(100);

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <TopHudBar systemName="Sol" credits={credits} energy={energy} />
      <StarMapBackground />
      <CommandDrawer
        energy={energy}
        cargoHold={cargoHold}
        discoveredCount={discoveredElements.size}
        codexComplete={complete}
        onMine={mineElement}
        onRecharge={handleRecharge}
      />
    </div>
  );
};

export default App;
