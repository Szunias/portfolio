import { createContext, useState, useContext, useRef, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';

import type { Track } from '../types';
import tracksData from '../data/tracks.json';

interface AudioControlsContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playlist: Track[];
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  loadPlaylist: (tracks: Track[]) => void;
  seek: (time: number) => void;
  volume: number;
  setVolume: (vol: number) => void;
  isPlayerVisible: boolean;
  closePlayer: () => void;
}

interface AudioProgressContextType {
  progress: number; // 0-100
  duration: number; // seconds
  currentTime: number; // seconds
}

const AudioControlsContext = createContext<AudioControlsContextType | undefined>(undefined);
const AudioProgressContext = createContext<AudioProgressContextType | undefined>(undefined);

/**
 * Global audio playback provider. Manages a single HTMLAudioElement shared across the app,
 * exposing play/pause/seek/volume controls and playlist navigation.
 * Wraps the entire app so any component can control audio via useAudio().
 */
export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(tracksData.length > 0 ? (tracksData[0] as Track) : null);
  const [playlist, setPlaylist] = useState<Track[]>(tracksData as Track[]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Refs mirror state for use inside event listeners, avoiding stale closures
  const playlistRef = useRef<Track[]>([]);
  const currentTrackRef = useRef<Track | null>(null);
  const playTrackRef = useRef<(track: Track) => void>(() => {});

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  // Create the shared HTMLAudioElement once and wire up all event listeners
  useEffect(() => {
    audioRef.current = new Audio();

    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    // Uses refs instead of state to access current playlist/track,
    // since this closure is created once and would otherwise go stale
    const handleEnded = () => {
       if (!currentTrackRef.current || playlistRef.current.length === 0) return;
       const currentIndex = playlistRef.current.findIndex(t => t.id === currentTrackRef.current?.id);
       const nextIndex = (currentIndex + 1) % playlistRef.current.length;
       const nextTrack = playlistRef.current[nextIndex];
       playTrackRef.current(nextTrack);
    };

    const handleError = (e: Event) => {
        console.error("Audio Error:", audio.error, e);
        setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', updateProgress);
      audio.removeEventListener('error', handleError);
      audio.pause();
      // Clear source and release network connection on unmount
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  // Sync volume to the audio element when it changes
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
    }
  }, [volume]);

  // Preload the first track so togglePlay works immediately on first click
  useEffect(() => {
    if (playlist.length > 0 && currentTrack) {
        const firstTrack = playlist[0];
        if (audioRef.current && firstTrack.sources && firstTrack.sources.length > 0) {
            const src = firstTrack.sources[0].url;
            if (src) {
                const formattedSrc = src.startsWith('http') || src.startsWith('/') ? src : `/${src}`;
                audioRef.current.src = encodeURI(formattedSrc);
                audioRef.current.load();
            }
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist]);

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
      // Check the audio element directly instead of relying on isPlaying state,
      // which can be stale when called from playTrack's closure
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.error("Playback failed", e));
      }
    }
  }, [currentTrack]);

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
        // Set track state BEFORE starting playback so UI is in sync during transition
        setCurrentTrack(track);

        const formattedSrc = src.startsWith('http') || src.startsWith('/') ? src : `/${src}`;
        audioRef.current.src = encodeURI(formattedSrc);
        audioRef.current.load();

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(e => {
              console.error("Playback failed", e);
              setIsPlaying(false);
            });
        }
      }
    }
  }, [currentTrack, togglePlay]);

  // Keep playTrack ref in sync so the handleEnded listener uses the latest version
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
    if (audioRef.current && audioRef.current.duration > 0) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const loadPlaylist = useCallback((tracks: Track[]) => {
    setPlaylist(tracks);
  }, []);

  const controlsValue = useMemo(() => ({
    currentTrack,
    isPlaying,
    playlist,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    loadPlaylist,
    seek,
    volume,
    setVolume,
    isPlayerVisible,
    closePlayer
  }), [
    currentTrack, isPlaying, playlist, playTrack, togglePlay, nextTrack,
    prevTrack, loadPlaylist, seek, volume, setVolume, isPlayerVisible, closePlayer
  ]);

  const progressValue = useMemo(() => ({
    progress,
    duration,
    currentTime,
  }), [progress, duration, currentTime]);

  return (
    <AudioControlsContext.Provider value={controlsValue}>
      <AudioProgressContext.Provider value={progressValue}>
        {children}
      </AudioProgressContext.Provider>
    </AudioControlsContext.Provider>
  );
};

/**
 * Hook to access audio controls (play/pause/seek/volume/playlist).
 * Only re-renders when controls change (track change, play/pause, volume).
 * Must be used within an AudioProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAudio = () => {
  const context = useContext(AudioControlsContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

/**
 * Hook to access audio progress (currentTime, duration, progress percentage).
 * Re-renders ~4x/sec during playback. Only use in components that display progress.
 * Must be used within an AudioProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAudioProgress = () => {
  const context = useContext(AudioProgressContext);
  if (context === undefined) {
    throw new Error('useAudioProgress must be used within an AudioProvider');
  }
  return context;
};
