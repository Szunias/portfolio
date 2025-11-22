export const TECH_CONNECTIONS: { [key: string]: string[] } = {
  'Unreal Engine 5': ['C++', 'Blueprints', 'Wwise', 'FMOD', '3D Audio'],
  'Unity': ['C#', 'Wwise', 'FMOD'],
  'Wwise': ['Unreal Engine 5', 'Unity', 'C++', 'C#', '3D Audio', 'Perforce'],
  'FMOD': ['Unreal Engine 5', 'Unity', 'C++', 'C#', '3D Audio'],
  'C++': ['Unreal Engine 5', 'Wwise', 'FMOD', 'JUCE'],
  'C#': ['Unity', 'Wwise', 'FMOD'],
  'JUCE': ['C++', 'DSP'],
  'Python': ['Reaper', 'TensorFlow'],
  'Reaper': ['Python', 'Wwise', '3D Audio', 'iZotope'],
  'Blueprints': ['Unreal Engine 5'],
  'Perforce': ['Unreal Engine 5', 'Wwise', 'C++'],
  'GitHub': ['C++', 'C#', 'Python', 'Unreal Engine 5'],
  '3D Audio': ['Unreal Engine 5', 'Unity', 'Wwise', 'FMOD'],
  'DSP': ['C++', 'JUCE', 'Pure Data'],
  'Pure Data': ['DSP', 'Wwise'], // Assuming PD can be used for prototyping or Heavy
  'Logic Pro': ['Wwise', 'FMOD'],
  'Cubase': ['Wwise', 'FMOD'],
  'Studio One': ['Wwise', 'FMOD'],
  'Ableton': ['Wwise', 'FMOD'],
  'iZotope': ['Reaper', 'Logic Pro', 'Cubase']
};
