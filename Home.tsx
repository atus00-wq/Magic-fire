import { useEffect } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import Camera from '@/components/Camera';
import SettingsPanel from '@/components/SettingsPanel';
import MultiplayerControls from '@/components/MultiplayerControls';
import DiscoveryAlert from '@/components/DiscoveryAlert';
import TutorialOverlay from '@/components/TutorialOverlay';
import GameHeader from '@/components/GameHeader';
import DiscoveryPanel from '@/components/DiscoveryPanel';

export default function Home() {
  const { settingsOpen, showTutorial, showDiscovery } = useGameContext();

  // Set title and meta description for SEO
  useEffect(() => {
    document.title = "AI Fire Geeter - Smart Fire Detection";
    
    // Add meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 
      'Detect real flames instantly with your camera using AI technology. Automatic alarm alerts when fire is detected, perfect for classroom demonstrations.');
    
    // Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', 'AI Fire Geeter - Smart Fire Detection');
    
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', 
      'Detect real flames instantly with your camera using AI technology. Automatic alarm alerts when fire is detected, perfect for classroom demonstrations.');
    
    let ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) {
      ogType = document.createElement('meta');
      ogType.setAttribute('property', 'og:type');
      document.head.appendChild(ogType);
    }
    ogType.setAttribute('content', 'website');
  }, []);

  return (
    <div className="max-w-md mx-auto relative min-h-screen flex flex-col">
      <GameHeader />
      
      <main className="flex-1 p-4 flex flex-col">
        <Camera />
        <DiscoveryPanel />
      </main>
      
      <MultiplayerControls />
      
      {/* Overlays */}
      {settingsOpen && <SettingsPanel />}
      {showTutorial && <TutorialOverlay />}
      {showDiscovery && <DiscoveryAlert />}
    </div>
  );
}
