import React from 'react';
import { useSpotifyPlayer } from '../../hooks/useSpotify';
import './spotify.css'
import { Tracks } from './tracks'
import PlayPause from './PlayPause';
import FastForwardOrRewind from './FastForwardOrRewind';
import PlayerSlider from './PlayerSlider';
const SpotifyWebPlayer = ({ token, refreshToken }: { token: string, refreshToken: string }) => {
  const uris = Tracks.tracks.map((t: any) => t.uri).reverse();
  const tracks = Tracks.tracks
  const {
    isActive,
    isPaused,
    currentTrack,
    elapsed,
    duration,
    togglePlay,
    nextTrack,
    previousTrack,
    seek
  } = useSpotifyPlayer(token, uris, refreshToken);

  const getTimerString = (givenSeconds: number) => {
    let hours = Math.floor(givenSeconds / 3600);
    let minutes = Math.floor((givenSeconds - (hours * 3600)) / 60);
    let seconds = givenSeconds - (hours * 3600) - (minutes * 60);
    let timeString = minutes.toString().padStart(2, '0') + ':' +
      seconds.toString().padStart(2, '0');
    return timeString
  }

  if (!isActive) {
    return <p className="text-center">No active Spotify session. Open your app and try again.</p>;
  }

  return (
    <div className="spotifyPlayContainer">
      <div className='leftSide'>
        <img src={currentTrack?.album?.images[0]?.url} alt="album" className="trackImage" />
      </div>
      <div className='rightSide'>
        {tracks.map((track) => {
          return (
            <div className='track'>{track.name}</div>
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
      {/* <button onClick={() => seek(60000)}>test</button> */}
      {/* <div className="">
        <button onClick={previousTrack}>&lt;&lt;</button>
        <button onClick={togglePlay}>{isPaused ? 'Play' : 'Pause'}</button>
        <button onClick={nextTrack}>&gt;&gt;</button>
      </div> */}


      {/* <div className="mt-2 text-sm text-gray-500">
        {Math.floor(elapsed / 1000)}s / {Math.floor(duration / 1000)}s
      </div> */}
    </div>
  );
};

export default SpotifyWebPlayer;
