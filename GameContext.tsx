import { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  ReactNode,
  useEffect
} from 'react';
import { apiRequest } from '@/lib/queryClient';
import { type Player, type Discovery } from '@shared/schema';

interface GameContextType {
  // Camera states
  cameraActive: boolean;
  isDetecting: boolean;
  flameDetected: boolean;
  detectionAccuracy: number;
  requestCameraAccess: () => void;
  setFlameDetected: (detected: boolean) => void;
  setDetectionAccuracy: (accuracy: number) => void;
  
  // Settings
  settingsOpen: boolean;
  toggleSettings: () => void;
  closeSettings: () => void;
  sensitivity: number;
  updateSensitivity: (value: number) => void;
  soundEffectsEnabled: boolean;
  toggleSoundEffects: () => void;
  particleEffectsEnabled: boolean;
  toggleParticleEffects: () => void;
  confirmResetProgress: () => void;
  
  // Tutorial
  showTutorial: boolean;
  completeTutorial: () => void;
  
  // Discovery
  discoveries: Discovery[];
  showDiscovery: boolean;
  currentDiscovery: Discovery | null;
  acknowledgeDiscovery: () => void;
  checkForNewDiscoveries: () => void;
  
  // Location
  currentLocation: string;
  secretsFound: number;
  totalSecrets: number;
  
  // Multiplayer
  players: Player[];
  addLocalPlayer: () => void;
  switchActivePlayer: (playerId: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [flameDetected, setFlameDetected] = useState(false);
  const [detectionAccuracy, setDetectionAccuracy] = useState(96);
  
  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sensitivity, setSensitivity] = useState(7);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [particleEffectsEnabled, setParticleEffectsEnabled] = useState(true);
  
  // Tutorial
  const [showTutorial, setShowTutorial] = useState(true);
  
  // Discovery
  const [discoveries, setDiscoveries] = useState<Discovery[]>([
    {
      id: 1,
      name: "Blue Wisp Flame",
      description: "Grants ability to see hidden paths",
      hint: "Grants ability to see hidden paths",
      discovered: false
    },
    {
      id: 2,
      name: "Ancient Ember",
      description: "Reveals ancient secrets of the forest",
      hint: "Find in the deepest part of the forest",
      discovered: false
    },
    {
      id: 3,
      name: "Golden Flame",
      description: "Allows passage through magical barriers",
      hint: "Hidden in plain sight",
      discovered: false
    }
  ]);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [currentDiscovery, setCurrentDiscovery] = useState<Discovery | null>(null);
  
  // Location 
  const [currentLocation, setCurrentLocation] = useState("Mystic Forest");
  const [secretsFound, setSecretsFound] = useState(0);
  const [totalSecrets, setTotalSecrets] = useState(7);
  
  // Multiplayer
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "Player 1", isActive: true, discoveries: 0 }
  ]);

  // Initialize default player and load game state
  useEffect(() => {
    // Initialize default player
    const initializeApp = async () => {
      try {
        // Call init endpoint to ensure we have a default player
        const response = await apiRequest('GET', '/api/init');
        console.log('App initialized:', response);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    
    // Call init endpoint
    initializeApp();
    
    // Load saved game state
    try {
      const savedState = localStorage.getItem('enchantedFlameState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        if (parsedState.discoveries) setDiscoveries(parsedState.discoveries);
        if (parsedState.players) setPlayers(parsedState.players);
        if (parsedState.secretsFound) setSecretsFound(parsedState.secretsFound);
        if (parsedState.sensitivity) setSensitivity(parsedState.sensitivity);
        if (parsedState.soundEffectsEnabled !== undefined) 
          setSoundEffectsEnabled(parsedState.soundEffectsEnabled);
        if (parsedState.particleEffectsEnabled !== undefined) 
          setParticleEffectsEnabled(parsedState.particleEffectsEnabled);
        
        // Only disable tutorial if it was completed before
        if (parsedState.tutorialCompleted) setShowTutorial(false);
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
  }, []);

  // Save game state to localStorage when state changes
  useEffect(() => {
    try {
      const gameState = {
        discoveries,
        players,
        secretsFound,
        sensitivity,
        soundEffectsEnabled,
        particleEffectsEnabled,
        tutorialCompleted: !showTutorial
      };
      localStorage.setItem('enchantedFlameState', JSON.stringify(gameState));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [
    discoveries, 
    players, 
    secretsFound, 
    sensitivity, 
    soundEffectsEnabled, 
    particleEffectsEnabled,
    showTutorial
  ]);

  // Request camera access
  const requestCameraAccess = useCallback(() => {
    setCameraActive(true);
    setIsDetecting(true);
  }, []);

  // Settings functions
  const toggleSettings = useCallback(() => {
    setSettingsOpen(prev => !prev);
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const updateSensitivity = useCallback((value: number) => {
    setSensitivity(value);
  }, []);

  const toggleSoundEffects = useCallback(() => {
    setSoundEffectsEnabled(prev => !prev);
  }, []);

  const toggleParticleEffects = useCallback(() => {
    setParticleEffectsEnabled(prev => !prev);
  }, []);

  const confirmResetProgress = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all game progress?')) {
      // Reset discoveries
      setDiscoveries(prev => 
        prev.map(discovery => ({ ...discovery, discovered: false }))
      );
      
      // Reset player discoveries
      setPlayers(prev => 
        prev.map(player => ({ ...player, discoveries: 0 }))
      );
      
      // Reset secrets count
      setSecretsFound(0);
      
      // Close settings panel
      setSettingsOpen(false);
    }
  }, []);

  // Tutorial function
  const completeTutorial = useCallback(() => {
    setShowTutorial(false);
  }, []);

  // Discovery functions
  const acknowledgeDiscovery = useCallback(() => {
    setShowDiscovery(false);
    setCurrentDiscovery(null);
  }, []);

  const checkForNewDiscoveries = useCallback(() => {
    // Get active player
    const activePlayer = players.find(p => p.isActive);
    if (!activePlayer) return;
    
    // Find an undiscovered item
    const undiscoveredItems = discoveries.filter(d => !d.discovered);
    if (undiscoveredItems.length === 0) return;
    
    // 25% chance to discover a new item when flame is detected
    if (Math.random() < 0.25) {
      // Select a random undiscovered item
      const randomIndex = Math.floor(Math.random() * undiscoveredItems.length);
      const discoveryItem = undiscoveredItems[randomIndex];
      
      // Update discoveries
      setDiscoveries(prev => 
        prev.map(item => 
          item.id === discoveryItem.id 
            ? { ...item, discovered: true } 
            : item
        )
      );
      
      // Update player discoveries
      setPlayers(prev => 
        prev.map(player => 
          player.id === activePlayer.id 
            ? { ...player, discoveries: player.discoveries + 1 } 
            : player
        )
      );
      
      // Update overall secrets found
      setSecretsFound(prev => prev + 1);
      
      // Show discovery alert
      setCurrentDiscovery(discoveryItem);
      setShowDiscovery(true);

      // Record discovery to server
      try {
        apiRequest('POST', '/api/discovery', {
          playerId: activePlayer.id,
          discoveryId: discoveryItem.id
        });
      } catch (error) {
        console.error('Failed to record discovery:', error);
      }
    }
  }, [discoveries, players]);

  // Multiplayer functions
  const addLocalPlayer = useCallback(() => {
    const newPlayerId = Math.max(0, ...players.map(p => p.id)) + 1;
    setPlayers(prev => [
      ...prev, 
      { 
        id: newPlayerId, 
        name: `Player ${newPlayerId}`, 
        isActive: false, 
        discoveries: 0 
      }
    ]);
  }, [players]);

  const switchActivePlayer = useCallback((playerId: number) => {
    setPlayers(prev => 
      prev.map(player => ({
        ...player,
        isActive: player.id === playerId
      }))
    );
  }, []);

  // Context value
  const value = {
    // Camera states
    cameraActive,
    isDetecting,
    flameDetected,
    detectionAccuracy,
    requestCameraAccess,
    setFlameDetected,
    setDetectionAccuracy,
    
    // Settings
    settingsOpen,
    toggleSettings,
    closeSettings,
    sensitivity,
    updateSensitivity,
    soundEffectsEnabled,
    toggleSoundEffects,
    particleEffectsEnabled,
    toggleParticleEffects,
    confirmResetProgress,
    
    // Tutorial
    showTutorial,
    completeTutorial,
    
    // Discovery
    discoveries,
    showDiscovery,
    currentDiscovery,
    acknowledgeDiscovery,
    checkForNewDiscoveries,
    
    // Location
    currentLocation,
    secretsFound,
    totalSecrets,
    
    // Multiplayer
    players,
    addLocalPlayer,
    switchActivePlayer
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
