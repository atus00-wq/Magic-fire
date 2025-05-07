import { useGameContext } from '@/contexts/GameContext';
import { FaTimes } from 'react-icons/fa';

export default function SettingsPanel() {
  const { 
    closeSettings, 
    sensitivity, 
    updateSensitivity,
    soundEffectsEnabled,
    toggleSoundEffects,
    particleEffectsEnabled, 
    toggleParticleEffects,
    confirmResetProgress
  } = useGameContext();

  return (
    <div 
      className="absolute inset-0 bg-neutral/95 z-10 p-6 transition-all"
      style={{ transform: 'translateX(0%)' }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display text-accent">Settings</h2>
        <button 
          onClick={closeSettings}
          className="text-gray-300 hover:text-white"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-accent mb-2">Detection Sensitivity</h3>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={sensitivity} 
            onChange={(e) => updateSensitivity(parseInt(e.target.value))}
            className="w-full" 
          />
          <div className="flex justify-between text-sm mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
        
        <div>
          <h3 className="text-accent mb-2">Sound Effects</h3>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={soundEffectsEnabled} 
              onChange={toggleSoundEffects}
              className="mr-2" 
            />
            <span>Enable sound effects</span>
          </label>
        </div>
        
        <div>
          <h3 className="text-accent mb-2">Visual Effects</h3>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={particleEffectsEnabled} 
              onChange={toggleParticleEffects}
              className="mr-2" 
            />
            <span>Show magical particles</span>
          </label>
        </div>
        
        <div>
          <h3 className="text-accent mb-2">Reset Progress</h3>
          <button 
            onClick={confirmResetProgress}
            className="bg-danger/80 hover:bg-danger text-white py-2 px-4 rounded"
          >
            Reset All Discoveries
          </button>
        </div>
      </div>
    </div>
  );
}
