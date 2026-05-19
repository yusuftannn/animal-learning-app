import { useState } from 'react';

import { AnimalSoundGame } from './src/features/animal-sounds/components/AnimalSoundGame';
import { AnimalsPage } from './src/features/animal-sounds/components/AnimalsPage';
import type { AppTab } from './src/features/animal-sounds/components/AnimalAppChrome';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('sounds');

  if (activeTab === 'animals') {
    return <AnimalsPage activeTab={activeTab} onTabChange={setActiveTab} />;
  }

  return <AnimalSoundGame activeTab={activeTab} onTabChange={setActiveTab} />;
}
