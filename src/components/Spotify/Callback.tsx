// src/pages/Callback.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppDispatch } from '../../redux/hooks';
import { setAccessToken, setExpiresIn, setRefreshToken } from '../../redux/slices/SpotifySlice';
import { API_URL } from '../../config/config';


const Callback = () => {
  const [searchParams] = useSearchParams();
  const dispatch =  useAppDispatch()
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      axios
        .post(`${API_URL}/spotify/token`, { code })
        .then(res => {
          const { access_token, refresh_token, expires_in } = res.data;
          console.log({ access_token, refresh_token, expires_in })
          dispatch(setAccessToken(access_token))
          dispatch(setRefreshToken(refresh_token))
          dispatch(setExpiresIn(expires_in))
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          localStorage.setItem('expires_in', expires_in);
          localStorage.setItem('expired_by', `${Date.now() + 3600}`);
          navigate('/spotify');
        })
        .catch(err => {
          console.error('Token exchange failed:', err);
        });
    }
  }, [searchParams, navigate]);

  return <div>Logging you in…NOW</div>;
};

export default Callback;
