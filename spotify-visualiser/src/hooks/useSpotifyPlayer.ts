// Spotify Web Playback SDK Hook
// Manages Spotify player instance and playback state

import { useState, useEffect, useRef, useCallback } from 'react';
import { getValidAccessToken } from '../services/spotify';

declare global {
  interface Window {
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayer;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }

  interface SpotifyPlayer {
    connect: () => Promise<void>;
    disconnect: () => void;
    addListener: (event: string, callback: (state: any) => void) => void;
    removeListener: (event: string, callback?: (state: any) => void) => void;
    getCurrentState: () => Promise<SpotifyPlaybackState | null>;
    setName: (name: string) => Promise<void>;
    getVolume: () => Promise<number>;
    setVolume: (volume: number) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    togglePlay: () => Promise<void>;
    seek: (positionMs: number) => Promise<void>;
    previousTrack: () => Promise<void>;
    nextTrack: () => Promise<void>;
  }

  interface SpotifyPlaybackState {
    context: {
      uri: string | null;
      metadata: any;
    };
    disallows: {
      pausing: boolean;
      peeking_next: boolean;
      peeking_prev: boolean;
      seeking: boolean;
      skipping_next: boolean;
      skipping_prev: boolean;
    };
    paused: boolean;
    position: number;
    duration: number;
    track_window: {
      current_track: SpotifyTrack | null;
      next_tracks: SpotifyTrack[];
      previous_tracks: SpotifyTrack[];
    };
    volume: number;
  }

  interface SpotifyTrack {
    album: {
      images: Array<{ url: string }>;
      name: string;
    };
    artists: Array<{ name: string }>;
    duration_ms: number;
    id: string;
    name: string;
    uri: string;
  }
}

interface UseSpotifyPlayerReturn {
  player: SpotifyPlayer | null;
  isReady: boolean;
  deviceId: string | null;
  playbackState: SpotifyPlaybackState | null;
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  position: number;
  duration: number;
  volume: number;
  error: string | null;
  play: (uri: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  previousTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
}

export function useSpotifyPlayer(): UseSpotifyPlayerReturn {
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<SpotifyPlaybackState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<SpotifyPlayer | null>(null);

  // Initialize Spotify Player
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Spotify) {
      // Wait for SDK to load
      window.onSpotifyWebPlaybackSDKReady = () => {
        initializePlayer();
      };
      return;
    }

    initializePlayer();
  }, []);

  const initializePlayer = async () => {
    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setError('No valid access token. Please authenticate first.');
        return;
      }

      const spotifyPlayer = new window.Spotify.Player({
        name: 'Mnmnts Spotify Visualizer',
        getOAuthToken: async (cb) => {
          const token = await getValidAccessToken();
          if (token) {
            cb(token);
          }
        },
        volume: 0.5,
      });

      playerRef.current = spotifyPlayer;
      setPlayer(spotifyPlayer);

      // Add event listeners
      spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Spotify player ready with device ID:', device_id);
        setDeviceId(device_id);
        setIsReady(true);
        setError(null);
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Spotify player not ready:', device_id);
        setIsReady(false);
      });

      spotifyPlayer.addListener('player_state_changed', (state: SpotifyPlaybackState | null) => {
        if (state) {
          setPlaybackState(state);
        }
      });

      spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Spotify authentication error:', message);
        setError(`Authentication error: ${message}`);
        setIsReady(false);
      });

      spotifyPlayer.addListener('account_error', ({ message }: { message: string }) => {
        console.error('Spotify account error:', message);
        setError(`Account error: ${message}`);
        setIsReady(false);
      });

      spotifyPlayer.addListener('playback_error', ({ message }: { message: string }) => {
        console.error('Spotify playback error:', message);
        setError(`Playback error: ${message}`);
      });

      // Connect to player
      await spotifyPlayer.connect();
    } catch (err: any) {
      console.error('Failed to initialize Spotify player:', err);
      setError(err.message || 'Failed to initialize Spotify player');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, []);

  // Play track
  const play = useCallback(async (uri: string) => {
    if (!player || !deviceId) {
      throw new Error('Player not ready');
    }

    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      throw new Error('No valid access token');
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [uri],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to play track');
      }
    } catch (err: any) {
      console.error('Play error:', err);
      throw err;
    }
  }, [player, deviceId]);

  // Pause playback
  const pause = useCallback(async () => {
    if (!player) return;
    try {
      await player.pause();
    } catch (err: any) {
      console.error('Pause error:', err);
      throw err;
    }
  }, [player]);

  // Resume playback
  const resume = useCallback(async () => {
    if (!player) return;
    try {
      await player.resume();
    } catch (err: any) {
      console.error('Resume error:', err);
      throw err;
    }
  }, [player]);

  // Seek to position
  const seek = useCallback(async (positionMs: number) => {
    if (!player) return;
    try {
      await player.seek(positionMs);
    } catch (err: any) {
      console.error('Seek error:', err);
      throw err;
    }
  }, [player]);

  // Set volume
  const setVolume = useCallback(async (volume: number) => {
    if (!player) return;
    try {
      await player.setVolume(volume);
    } catch (err: any) {
      console.error('Set volume error:', err);
      throw err;
    }
  }, [player]);

  // Previous track
  const previousTrack = useCallback(async () => {
    if (!player) return;
    try {
      await player.previousTrack();
    } catch (err: any) {
      console.error('Previous track error:', err);
      throw err;
    }
  }, [player]);

  // Next track
  const nextTrack = useCallback(async () => {
    if (!player) return;
    try {
      await player.nextTrack();
    } catch (err: any) {
      console.error('Next track error:', err);
      throw err;
    }
  }, [player]);

  return {
    player,
    isReady,
    deviceId,
    playbackState,
    isPlaying: playbackState?.paused === false,
    currentTrack: playbackState?.track_window.current_track || null,
    position: playbackState?.position || 0,
    duration: playbackState?.duration || 0,
    volume: playbackState?.volume || 0.5,
    error,
    play,
    pause,
    resume,
    seek,
    setVolume,
    previousTrack,
    nextTrack,
  };
}

