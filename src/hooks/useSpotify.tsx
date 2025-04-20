import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { refreshSpotifyToken, selectExpiredBy } from '../redux/slices/SpotifySlice';


declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export function useSpotifyPlayer(token: string, uris: string[], refreshToken: string) {
  const playerRef = useRef<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  // const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [elapsed, setElapsed] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isReady, setIsReady] = useState(false)
  const expiredBy = useAppSelector(selectExpiredBy)
  const dispatch = useAppDispatch()

  // Load Spotify SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);
  
    return () => {
      document.body.removeChild(script); // ✅ return a cleanup function
    };
  }, []);
  

  // Initialize SDK
  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Brigid Spotify Player',
        getOAuthToken: (cb: (token: string) => void) => cb(token),
        volume: 0.5,
      });

      playerRef.current = player;

      player.addListener('ready', async ({ device_id }: any) => {
        setDeviceId(device_id);

        try {
          // Transfer playback to this device
          await axios.put(
            'https://api.spotify.com/v1/me/player',
            {
              device_ids: [device_id],
              play: true
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // Play the full track list
          if (uris.length > 0) {
            if (Number(expiredBy) < Date.now()) dispatch(refreshSpotifyToken(refreshToken))
            await axios.put(
              `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
              {
                uris,
                offset: { position: 0 },
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          }
        } catch (error) {
          console.error('Failed to transfer or play:', error);
        }
      });

      player.addListener('player_state_changed', (state: any) => {
        if (!state) return;

        setCurrentTrack(state.track_window.current_track);
        setIsPaused(state.paused);
        setElapsed(state.position);
        setDuration(state.duration);

        player.getCurrentState().then((s: any) => {
          setIsActive(!!s);
        });
      });

      player.addListener('ready', ({ device_id }: any) => {
        console.log('The Web Playback SDK is ready to play music!');
        setIsReady(true)
        console.log('Device ID', device_id);
      })

      player.connect();
    };
  }, [token, uris]);

  // Time tracking
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (!isPaused) {
      interval = setInterval(() => {
        setElapsed(prev => Math.min(prev + 1000, duration));
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isPaused, duration]);

  // Control methods
  const togglePlay = () => playerRef.current?.togglePlay();
  const nextTrack = () => playerRef.current?.nextTrack();
  const previousTrack = () => playerRef.current?.previousTrack();
  const seek = (positionMs: number) => {
    console.log('seek fired<<<<', positionMs)
    if (playerRef.current) {
      playerRef.current.seek(positionMs);
      console.log('seek fired<<<<2', positionMs)
      setElapsed(positionMs); // Optional: update local elapsed time immediately
    }
  };
  const selectTrackById = async (trackId: string) => {
    if (!deviceId) {
      console.warn('Device ID not set');
      return;
    }
  
    const fullUri = `spotify:track:${trackId}`;
    const index = uris.findIndex(uri => uri === fullUri);
  
    if (index === -1) {
      console.warn(`Track ID ${trackId} not found in uris`);
      return;
    }
  
    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          uris, // keep the full list
          offset: { position: index }, // jump to the track
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(`Playing track at index ${index}`);
    } catch (err) {
      console.error('Failed to select track by ID:', err);
    }
  };

  useEffect(() => {
    setDuration(0)
    setElapsed(0)
  }, [])

  

  return {
    isActive,
    isPaused,
    currentTrack,
    elapsed,
    duration,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    selectTrackById,
    isReady
  };
}
