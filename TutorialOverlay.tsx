import { useGameContext } from '@/contexts/GameContext';

export default function TutorialOverlay() {
  const { completeTutorial } = useGameContext();

  return (
    <div className="absolute inset-0 bg-neutral/90 z-20 flex items-center justify-center">
      <div className="max-w-xs p-6 bg-primary/20 rounded-xl backdrop-blur-sm border border-primary/40">
        <h2 className="text-xl font-display text-accent mb-4 text-center">Welcome, Flame Seeker!</h2>
        <p className="mb-4">Point your camera at small flames like matchsticks to discover magical secrets in this enchanted realm.</p>
        <p className="mb-6">Invite friends to join the adventure from the same device!</p>
        <div className="flex justify-center">
          <button 
            onClick={completeTutorial}
            className="bg-accent text-neutral font-medium py-2 px-6 rounded-full hover:bg-accent/80 transition-colors"
          >
            Begin Your Quest
          </button>
        </div>
      </div>
    </div>
  );
}
