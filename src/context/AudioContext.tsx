import { createContext, useState, useContext, useRef, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Track } from '../types';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playlist: Track[];
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  loadPlaylist: (tracks: Track[]) => void;
  progress: number; // 0-100
  duration: number; // seconds
  currentTime: number; // seconds
  seek: (time: number) => void;
  volume: number;
  setVolume: (vol: number) => void;
  isPlayerVisible: boolean;
  closePlayer: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Refs for state accessed inside event listeners to avoid stale closures
  const playlistRef = useRef<Track[]>([]);
  const currentTrackRef = useRef<Track | null>(null);
  const playTrackRef = useRef<(track: Track) => void>(() => {});

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    // Volume is set by the volume effect

    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    // We define handleEnded inside useEffect but it uses refs to access latest state
    const handleEnded = () => {
       if (!currentTrackRef.current || playlistRef.current.length === 0) return;
       const currentIndex = playlistRef.current.findIndex(t => t.id === currentTrackRef.current?.id);
       const nextIndex = (currentIndex + 1) % playlistRef.current.length;
       const nextTrack = playlistRef.current[nextIndex];
       
       // Use the ref to call playTrack, breaking the dependency cycle
       playTrackRef.current(nextTrack);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', updateProgress);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', updateProgress);
      audio.pause();
    };
  }, []); // Empty dependency array - init once!

  
  // Assign internal helper to ref so we can call it from useCallback without dependency issues if needed,
  // but here we can just duplicate or hoist. 
  // Actually, let's keep it simple. Accessing audioRef directly in playTrack is fine.
  
  // Update volume when state changes
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
    }
  }, [volume]);

  // Load Tracks on Mount
  useEffect(() => {
    fetch('/assets/audio/tracks.json')
      .then(res => res.json())
      .then(data => {
        setPlaylist(data);
        if (data.length > 0 && !currentTrackRef.current) {
            setCurrentTrack(data[0]);
        }
      })
      .catch(err => console.error("Failed to load tracks:", err));
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
  }, []);

  const closePlayer = useCallback(() => {
    setIsPlayerVisible(false);
    if (audioRef.current) {
        audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed", e));
      }
      setIsPlaying(prev => !prev);
    }
  }, [currentTrack, isPlaying]);

  const playTrack = useCallback((track: Track) => {
    setIsPlayerVisible(true);
    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    if (audioRef.current) {
      if (!track.sources || track.sources.length === 0) {
        console.warn(`Track ${track.title} has no sources.`);
        return;
      }
      const src = track.sources[0]?.url;
      if (src) {
        audioRef.current.src = src.startsWith('http') || src.startsWith('/') ? src : `/${src}`;
        audioRef.current.play().catch(e => console.error("Playback failed", e));
        setCurrentTrack(track);
        setIsPlaying(true);
      }
    }
  }, [currentTrack, togglePlay]);

  // Keep ref in sync
  useEffect(() => {
    playTrackRef.current = playTrack;
  }, [playTrack]);


  const nextTrack = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playTrack(playlist[nextIndex]);
  }, [currentTrack, playlist, playTrack]);

  const prevTrack = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(playlist[prevIndex]);
  }, [currentTrack, playlist, playTrack]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const loadPlaylist = useCallback((tracks: Track[]) => {
    setPlaylist(tracks);
  }, []);

  const value = useMemo(() => ({
    currentTrack,
    isPlaying,
    playlist,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    loadPlaylist,
    progress,
    duration,
    currentTime,
    seek,
    volume,
    setVolume,
    isPlayerVisible,
    closePlayer
  }), [
    currentTrack, isPlaying, playlist, playTrack, togglePlay, nextTrack, 
    prevTrack, loadPlaylist, progress, duration, currentTime, seek, 
    volume, setVolume, isPlayerVisible, closePlayer
  ]);

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
