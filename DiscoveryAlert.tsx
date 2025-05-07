import { FaFire } from 'react-icons/fa';
import { useGameContext } from '@/contexts/GameContext';

export default function DiscoveryAlert() {
  const { 
    acknowledgeDiscovery, 
    currentDiscovery 
  } = useGameContext();

  if (!currentDiscovery) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-neutral/50">
      <div className="transform animate-bounce">
        <div className="p-6 bg-accent/90 rounded-xl text-center max-w-xs">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-3">
            <FaFire className="text-3xl text-accent" />
          </div>
          <h3 className="text-xl font-display text-neutral mb-2">New Discovery!</h3>
          <p className="text-neutral/80 mb-4">You found the {currentDiscovery.name}!</p>
          <p className="text-sm text-neutral/80 mb-4">{currentDiscovery.description}</p>
          <button 
            onClick={acknowledgeDiscovery}
            className="bg-primary text-white py-2 px-6 rounded-full hover:bg-primary/80 transition-colors"
          >
            Amazing!
          </button>
        </div>
      </div>
    </div>
  );
}
