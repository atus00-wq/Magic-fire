import { FaFireFlameCurved, FaQuestion } from 'react-icons/fa6';
import { useGameContext } from '@/contexts/GameContext';

export default function DiscoveryPanel() {
  const { discoveries } = useGameContext();

  return (
    <div className="mt-4 bg-neutral/50 rounded-xl p-4 shadow-lg border border-primary/20">
      <h2 className="font-display text-lg text-accent mb-2">Magical Discovery</h2>
      
      {/* Discovery status */}
      <div className="space-y-3">
        {discoveries.map((discovery) => (
          <div key={discovery.id} className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
              {discovery.discovered ? (
                <FaFireFlameCurved className="text-accent" />
              ) : (
                <FaQuestion className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <span>{discovery.name}</span>
                <span className={discovery.discovered ? "text-accent" : "text-gray-400"}>
                  {discovery.discovered ? "Found!" : "Not found"}
                </span>
              </div>
              <div className="text-xs text-gray-300">{discovery.hint}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
