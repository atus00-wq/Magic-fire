import { FaPlus, FaUserCheck, FaUser, FaCamera, FaCrown } from 'react-icons/fa';
import { useGameContext } from '@/contexts/GameContext';

export default function MultiplayerControls() {
  const { players, addLocalPlayer, switchActivePlayer } = useGameContext();

  return (
    <div className="p-4 bg-neutral shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-accent">Players</h2>
        <button 
          onClick={addLocalPlayer}
          className="bg-primary/80 hover:bg-primary px-3 py-1 rounded-full text-sm transition-colors"
        >
          <FaPlus className="inline mr-1" /> Add Player
        </button>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-3">
        {players.map((player) => (
          <div key={player.id} className="bg-neutral/60 rounded-lg p-3 flex items-center">
            <div 
              className={`w-8 h-8 rounded-full ${player.isActive ? 'bg-accent' : 'bg-primary'} flex items-center justify-center mr-2`}
            >
              {player.isActive ? <FaCrown /> : <FaUser />}
            </div>
            <div className="flex-1">
              <div className="font-medium">{player.name}</div>
              <div className="text-xs text-green-300">{player.discoveries} discoveries</div>
            </div>
            <div>
              {player.isActive ? (
                <div className="text-accent text-xl">
                  <FaUserCheck />
                </div>
              ) : (
                <button 
                  onClick={() => switchActivePlayer(player.id)}
                  className="text-accent hover:text-accent/80"
                >
                  <FaCamera />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
