import { useSpotifyPlayer } from '../../hooks/useSpotify';
import './spotify.css'
// import { Tracks } from './tracks'
import PlayPause from './PlayPause';
import FastForwardOrRewind from './FastForwardOrRewind';
import PlayerSlider from './PlayerSlider';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectTracks, selectUris, setTracks } from '../../redux/slices/SpotifySlice';
import { useEffect } from 'react';

const SpotifyWebPlayer = ({ token, refreshToken }: { token: string, refreshToken: string }) => {
  const dispatch = useAppDispatch()
  const tracks = useAppSelector(selectTracks)
  const uris = useAppSelector(selectUris)
  const {
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
    isReady,
    play,
    pause
  } = useSpotifyPlayer(token, uris, refreshToken);

  const getTimerString = (givenSeconds: number) => {
    let hours = Math.floor(givenSeconds / 3600);
    let minutes = Math.floor((givenSeconds - (hours * 3600)) / 60);
    let seconds = givenSeconds - (hours * 3600) - (minutes * 60);
    let timeString = minutes.toString().padStart(2, '0') + ':' +
      seconds.toString().padStart(2, '0');
    return timeString
  }

  useEffect(() => {
    if (isReady) {
      const timeout = setTimeout(() => {
        // togglePlay(); 
        play()
      }, 3000);
  
      return () => {
        if (!isPaused) togglePlay();
        seek(0)
        pause()
        dispatch(setTracks([]))
        clearTimeout(timeout);
      };
    }
  }, [isReady]);

  // useEffect(() => {
  //   playNextTracks(uris)
  // }, [tracks])

  if (!isActive) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="spotifyPlayContainer">
      <div className='leftSide'>
        <img src={currentTrack?.album?.images[0]?.url} alt="album" className="trackImage" />
      </div>
      <div className='rightSide'>
        {tracks.map((track) => {
          return (
            <div
              key={track.id}
              className={currentTrack?.id !== track?.id ?  'track' : 'currentlyPlayingTrack'}
              onClick={() => selectTrackById(track.id)}
              >
                {track.name}
              </div>
          )
        })}
      </div>
      <div className='trackInfo'>
        <div>
          <h3 style={{ fontWeight: 900 }}>{currentTrack?.name}</h3>
          <p style={{ fontWeight: 600 }}>{currentTrack?.artists?.[0]?.name}</p>
        </div>
        <div>
        </div>
        <div className='spotifyPlayerControls'>
          <FastForwardOrRewind isFastforward={false} onClick={previousTrack} />
          <PlayPause isPlaying={isPaused} onClick={togglePlay} />
          <FastForwardOrRewind isFastforward={true} onClick={nextTrack} />
        </div>
      </div>
      <div className='sliderContainer'>
        <PlayerSlider
          min={'0'}
          max={`${Math.floor(duration / 1000)}`}
          value={`${Math.floor(elapsed / 1000)}`}
          onChange={seek}
        />
        <p className='timer'>{`${getTimerString(Math.floor(elapsed / 1000))} /  ${getTimerString(Math.floor(duration / 1000))}`}</p>
      </div>
    </div>
  );
};

export default SpotifyWebPlayer;
