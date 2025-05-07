import { FaFireFlameCurved, FaGear, FaMapLocationDot } from 'react-icons/fa6';
import { useGameContext } from '@/contexts/GameContext';

export default function GameHeader() {
  const { toggleSettings, currentLocation, secretsFound, totalSecrets } = useGameContext();

  return (
    <header className="pt-4 px-4 pb-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display text-accent">
          <FaFireFlameCurved className="inline mr-2" />AI Fire Geeter
        </h1>
        <button 
          onClick={toggleSettings}
          className="text-accent hover:text-accent/80 transition-colors"
        >
          <FaGear className="text-xl" />
        </button>
      </div>
      
      {/* World exploration progress */}
      <div className="flex items-center mt-2 bg-neutral/50 rounded-lg p-2">
        <FaMapLocationDot className="text-secondary mr-2" />
        <div className="flex-1">
          <div className="flex justify-between">
            <span className="text-sm">{currentLocation}</span>
            <span className="text-sm text-accent">{secretsFound}/{totalSecrets} secrets found</span>
          </div>
          <div className="h-2 bg-neutral rounded mt-1 overflow-hidden">
            <div 
              className="h-full bg-secondary" 
              style={{ width: `${(secretsFound / totalSecrets) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </header>
  );
}
