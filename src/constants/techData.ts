export const TECH_ICON_MAP: { [key: string]: string } = {
  'Wwise': 'wwiselogo.png', 
  'FMOD': 'fmodlogo.png', 
  'Unreal': 'Unreal_Engine-Logo.wine.png',
  'Unity': 'Unitylogo.png', 
  'Reaper': 'REAPER_logo.png', 
  'Python': 'pythonlogo.png',
  'C++': 'cpplogo.png', 
  'C#': 'csharplogo.png', 
  'Blueprints': 'Unreal_Engine-Logo.wine.png',
  'JUCE': 'JUCE_Logo.png', 
  'GitHub': 'github.png',
  '3D Audio': '3DAudio.png',
  'Pure Data': 'puredatalogo.png',
  'Logic Pro': 'logicproicon.png',
  'Cubase': 'Cubaselogo.png',
  'Studio One': 'studiooneicon.png',
  'Ableton': 'abletonlogo.png',
  'Perforce': 'Perforcelogo.png',
  'iZotope': 'dsplogo.png'
};

export const TECH_CATEGORIES = [
  {
    id: 'code',
    title: 'PROGRAMMING',
    subtitle: 'Core Logic',
    accentColor: '#ef4444',
    items: ['C++', 'C#', 'Python', 'Blueprints', 'JUCE', 'Pure Data']
  },
  {
    id: 'middleware',
    title: 'AUDIO TECH',
    subtitle: 'Interactive Systems',
    accentColor: '#3b82f6',
    items: ['Wwise', 'FMOD', 'MetaSounds', '3D Audio']
  },
  {
    id: 'engine',
    title: 'GAME ENGINES',
    subtitle: 'Environment',
    accentColor: '#a855f7',
    items: ['Unreal Engine 5', 'Unity']
  },
  {
    id: 'tools',
    title: 'PRODUCTION',
    subtitle: 'DAW & Pipeline',
    accentColor: '#eab308',
    items: ['Reaper', 'Logic Pro', 'iZotope RX', 'GitHub', 'Perforce']
  }
];
