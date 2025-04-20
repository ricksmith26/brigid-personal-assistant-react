import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export type SpotifyTrack = {
    name: string;
    artist: string;
    uri: string;
    id: string;
    preview_url: string | null;
    album: {
      name: string;
      image: string | null;
    };
  };
  

interface SpotifyState {
    access_token: string | null,
    refresh_token: string | null,
    expires_in: string | null,
    expired_by: string | null,
    tracks: SpotifyTrack[],
    uris: string[]
}

const initialState: SpotifyState = {
    access_token: null,
    refresh_token: null,
    expires_in: null,
    expired_by: null,
    tracks: [],
    uris: []
}

// authThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const clientId = 'bc445b54c9a94b649f73f923c675320b'; // Replace with your actual client ID

// store/thunks/refreshToken.ts

export const refreshSpotifyToken = createAsyncThunk(
  'auth/refreshSpotifyToken',
  async (refreshToken: string) => {
    try {
      const response = await axios.post(`${process.env.API_URL}/spotify/refresh`, {
        refresh_token: refreshToken,
      });
      const authReponse = response.data
      console.log(authReponse, '<<authResp')
      localStorage.setItem('expired_by', `${Date.now()}`);
      localStorage.setItem('access_token', authReponse.access_token);
      localStorage.setItem('expires_in', authReponse.expires_in);
      return response.data; // contains access_token
    } catch (err: any) {
      console.error('Thunk error:', err);
      throw err
    }
  }
);



export const spotifySlice = createSlice({
    name: 'spotify',
    initialState,
    reducers: {
        setAccessToken: (state, action) => {
            state.access_token = action.payload
        },
        setRefreshToken: (state, action) => {
            state.refresh_token = action.payload
        },
        setExpiresIn: (state, action) => {
            state.expires_in = action.payload
        },
        setExpiredBy: (state, action) => {
            state.expired_by = action.payload
        },
        setTracks: (state, action) => {
          console.log("tracks>>", action.payload, '<<<TRACKS')
          state.tracks = [...action.payload]
          state.uris = [...action.payload.map((t: any) => t.uri)];
        }
    },
    extraReducers: (builder) => {
        builder.addCase(refreshSpotifyToken.fulfilled, (state, action) => {
            state.access_token = action.payload.access_token
            state.refresh_token = action.payload.refresh_token
            state.expires_in = action.payload.expires_in
        })
    }
})

export const { setAccessToken, setRefreshToken, setExpiresIn, setExpiredBy, setTracks } = spotifySlice.actions

export const selectAccessToken = (state: RootState) => state.spotifySlice.access_token
export const selectRefreshToken = (state: RootState) => state.spotifySlice.refresh_token
export const selectExpiresIn = (state: RootState) => state.spotifySlice.expires_in
export const selectExpiredBy = (state: RootState) => state.spotifySlice.expired_by
export const selectTracks = (state: RootState) => state.spotifySlice.tracks
export const selectUris = (state: RootState) => state.spotifySlice.uris

export default spotifySlice.reducer