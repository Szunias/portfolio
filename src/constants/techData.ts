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
  { title: 'Audio Middleware', items: ['Wwise', 'FMOD', '3D Audio'] },
  { title: 'Game Engines', items: ['Unreal Engine 5', 'Unity'] },
  { title: 'Programming', items: ['C++', 'C#', 'Python', 'Blueprints', 'JUCE', 'Pure Data'] },
  { title: 'DAW & Production', items: ['Reaper', 'Logic Pro', 'Cubase', 'Studio One', 'Ableton Live', 'iZotope RX'] },
  { title: 'Tools', items: ['Perforce', 'GitHub'] }
];
