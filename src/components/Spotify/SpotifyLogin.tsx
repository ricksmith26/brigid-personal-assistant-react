import React from 'react';

const clientId = 'bc445b54c9a94b649f73f923c675320b';
const redirectUri = 'http://127.0.0.1:5173/callback';


const SpotifyLogin: React.FC = () => {
  const handleLogin = () => {
    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-modify-playback-state',
      'user-read-playback-state'
    ];
    
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
      scopes.join(' ')
    )}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    

    window.location.href = authUrl;
  };

  return (
    <div>
      <h1>Login to Spotify</h1>
      <button onClick={handleLogin}>Login with Spotify</button>
    </div>
  );
};

export default SpotifyLogin;
